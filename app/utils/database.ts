import fs from 'fs';
import path from 'path';
import { remote } from 'electron';

const { app } = require('electron').remote;

const Sequelize = require('sequelize');

export const openDialog = () => {
  const databasePath = remote.dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{ name: 'Datbase', extensions: ['db', 'sqlite', 'sql'] }],
  });
  if (databasePath) {
    return databasePath[0];
  }
  return databasePath;
};

const checkForDB = () => {
  /*
  userData The directory for storing your app's configuration files, 
  which by default it is the appData directory appended with your app's name.
  */
  const userDataDir = app.getPath('userData');
  const absolutePath = path.join(userDataDir, 'pathToDB');

  // if the database path is stored in app data, read the file path
  if (fs.existsSync(absolutePath)) {
    return fs.readFileSync(absolutePath, 'utf8');
  }
  // Else open save dialog
  const pathContent = remote.dialog.showSaveDialogSync({
    title: 'Select folder',
    defaultPath: 'joyvet.db',
    properties: ['createDirectory'],
  });

  // Close app if path isn't given or cancel button pressed
  if (!pathContent) {
    app.quit();
    return null;
  }

  fs.writeFileSync(absolutePath, pathContent);
  return fs.readFileSync(absolutePath, 'utf8');
};

const checkForTestDB = () => {
  const testDatabasePath = openDialog();
  if (!testDatabasePath) {
    app.quit();
  }
  return testDatabasePath;
};

const database = (() => {
  if (process.env.NODE_ENV === 'development') {
    return new Sequelize({
      dialect: 'sqlite',
      storage: checkForTestDB(),
    });
  }
  return new Sequelize({
    dialect: 'sqlite',
    storage: checkForDB(),
  });
})();

export default database;
