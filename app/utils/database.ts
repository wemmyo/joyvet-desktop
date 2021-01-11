import fs from 'fs';
import path from 'path';
import { remote } from 'electron';

const app = require('electron').remote.app;

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

export default new Sequelize({
  dialect: 'sqlite',
  storage: checkForDB(),
});

// export default new Sequelize('joyvetStaging', 'root', '', {
//   dialect: 'mysql',
//   host: 'localhost',
// });
