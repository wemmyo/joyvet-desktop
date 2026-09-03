import { DataTypes } from 'sequelize';

import { ensureSchemaPatches } from '../schemaPatches';

describe('ensureSchemaPatches', () => {
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
