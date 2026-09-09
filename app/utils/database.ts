import fs from 'fs';
import path from 'path';
import { app, dialog } from 'electron';

const Sequelize = require('sequelize');

export const openDialog = () => {
  const result = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{ name: 'Database', extensions: ['db', 'sqlite', 'sql'] }],
  });
  if (result) return result[0];
  return undefined;
};

const getDatabasePointerPath = (): string =>
  path.join(app.getPath('userData'), 'pathToDB');

const readPersistedDatabasePath = (): string | undefined => {
  try {
    const pointerPath = getDatabasePointerPath();
    if (!fs.existsSync(pointerPath)) {
      return undefined;
    }

    const databasePath = fs.readFileSync(pointerPath, 'utf8').trim();
    return databasePath && fs.existsSync(databasePath)
      ? databasePath
      : undefined;
  } catch {
    return undefined;
  }
};

const checkForDB = (): string => {
  const persistedPath = readPersistedDatabasePath();
  if (persistedPath) {
    return persistedPath;
  }

  const pointerPath = getDatabasePointerPath();

  const pathContent = dialog.showSaveDialogSync({
    title: 'Select folder for database',
    defaultPath: 'joyvet.db',
    properties: ['createDirectory'],
  });

  if (!pathContent) {
    app.quit();
    return '';
  }

  fs.writeFileSync(pointerPath, pathContent);
  return pathContent;
};

const database = (() => {
  if (process.env.NODE_ENV === 'development') {
    const testPath = readPersistedDatabasePath() ?? openDialog();
    if (!testPath) {
      app.quit();
      return null;
    }
    // Persist the chosen path so backup/restore (which read the pathToDB
    // pointer) can locate the live database in dev too, matching production.
    try {
      fs.writeFileSync(getDatabasePointerPath(), testPath);
    } catch {
      // Non-fatal: the DB still opens; only backup/restore is affected.
    }
    return new Sequelize({
      dialect: 'sqlite',
      storage: testPath,
      dialectOptions: { connectTimeout: 3000 },
      logging: false,
    });
  }
  return new Sequelize({
    dialect: 'sqlite',
    storage: checkForDB(),
    dialectOptions: { connectTimeout: 3000 },
    logging: false,
  });
})();

export default database;
