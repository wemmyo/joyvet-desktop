import { DataTypes, type Sequelize } from 'sequelize';

type TableName = string | { tableName: string };

const toTableName = (tableName: TableName) =>
  typeof tableName === 'string' ? tableName : tableName.tableName;

/**
 * `database.sync()` does not add columns to existing SQLite tables.
 * Apply additive, idempotent patches after sync so older clinic DBs pick up
 * new fields without a destructive alter.
 */
export async function ensureSchemaPatches(
  database: Pick<Sequelize, 'getQueryInterface'>,
  productTableName: TableName
): Promise<void> {
  const queryInterface = database.getQueryInterface();
  const table = toTableName(productTableName);
  const columns = await queryInterface.describeTable(table);

  if (!columns.discontinued) {
    await queryInterface.addColumn(table, 'discontinued', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }
}
