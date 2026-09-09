import { DataTypes, Sequelize } from 'sequelize';

import { ensureSchemaPatches } from '../schemaPatches';

// The distributable is x64 for legacy macOS support, so local arm64 installs
// contain an x64 sqlite3 native module that the arm64 Node test runner cannot
// load. CI/x64 runs still exercise the real database path.
const sqliteIntegrationTest = process.arch === 'x64' ? it : it.skip;

describe('ensureSchemaPatches', () => {
  sqliteIntegrationTest(
    'patches a real legacy SQLite products table without losing rows',
    async () => {
      const database = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });
      const queryInterface = database.getQueryInterface();

      try {
        await queryInterface.createTable('products', {
          id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          title: { type: DataTypes.STRING, allowNull: false },
        });
        await queryInterface.bulkInsert('products', [{ title: 'Legacy item' }]);

        await ensureSchemaPatches(database, 'products');

        const columns = await queryInterface.describeTable('products');
        const [rows] = await database.query(
          'SELECT title, discontinued FROM products'
        );
        expect(columns.discontinued).toBeDefined();
        expect(rows).toEqual([{ title: 'Legacy item', discontinued: 0 }]);
      } finally {
        await database.close();
      }
    }
  );

  it('adds discontinued when the products table is missing the column', async () => {
    const addColumn = vi.fn();
    const describeTable = vi.fn().mockResolvedValue({
      id: {},
      title: {},
    });
    const database = {
      getQueryInterface: () => ({ describeTable, addColumn }),
    };

    await ensureSchemaPatches(database as any, 'products');

    expect(addColumn).toHaveBeenCalledWith(
      'products',
      'discontinued',
      expect.objectContaining({
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      })
    );
  });

  it('does not add discontinued when the column already exists', async () => {
    const addColumn = vi.fn();
    const describeTable = vi.fn().mockResolvedValue({
      discontinued: { type: 'TINYINT' },
    });
    const database = {
      getQueryInterface: () => ({ describeTable, addColumn }),
    };

    await ensureSchemaPatches(database as any, { tableName: 'products' });

    expect(addColumn).not.toHaveBeenCalled();
  });
});
