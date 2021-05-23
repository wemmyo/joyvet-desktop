import fs from 'fs';
import path from 'path';
import { remote } from 'electron';

const { app } = require('electron').remote;

const Sequelize = require('sequelize');

const checkForDB = () => {
  const userDataDir = app.getPath('userData');
  const absolutePath = path.join(userDataDir, 'pathToDB');

  if (fs.existsSync(absolutePath)) {
    return fs.readFileSync(absolutePath, 'utf8');
  }
  const pathContent = remote.dialog.showSaveDialogSync({
    title: 'Select folder',
    defaultPath: 'joyvet.db',
    properties: ['createDirectory'],
  });
  fs.writeFileSync(absolutePath, pathContent);
  return fs.readFileSync(absolutePath, 'utf8');
};

// export default new Sequelize({
//   dialect: 'sqlite',
//   storage: checkForDB(),
// });

let database;

const development = {
  database: 'joyvetStaging',
  username: 'root',
  password: '',
  host: 'localhost',
  dialect: 'mysql',
};

const production = {
  dialect: 'sqlite',
  storage: checkForDB(),
};

// export default new Sequelize('joyvetStaging', 'root', '', {
//   dialect: 'mysql',
//   host: 'localhost',
// });

switch (process.env.NODE_ENV) {
  case 'production':
    database = new Sequelize({
      dialect: production.dialect,
      storage: checkForDB(),
    });
    break;
  case 'development':
    database = new Sequelize(
      development.database,
      development.username,
      development.password,
      {
        host: development.host,
        dialect: development.dialect,
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
      }
    );
    break;
  default:
    database = new Sequelize(
      development.database,
      development.username,
      development.password,
      {
        host: development.host,
        dialect: development.dialect,
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
      }
    );
}

export default database;
