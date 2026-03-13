import { Sequelize } from 'sequelize';
import path from 'path';
import { app } from 'electron';

const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'joyvet.db');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Disable logging like in original
  define: {
    timestamps: false, // Match original: no timestamps
    underscored: false, // Match original: no underscored naming
    freezeTableName: true, // Keep exact table names
  },
});

export default sequelize;
