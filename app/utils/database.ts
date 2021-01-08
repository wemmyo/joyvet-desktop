import fs from 'fs';
import { remote } from 'electron';

const Sequelize = require('sequelize');

const checkForDB = () => {
  const pathToDB = 'pathToDB.txt';

  if (fs.existsSync(pathToDB)) {
    return fs.readFileSync('pathToDB.txt', 'utf8');
  }
  const pathContent = remote.dialog.showSaveDialogSync({
    title: 'Select folder',
    defaultPath: 'joyvet.db',
    properties: ['createDirectory'],
  });
  fs.writeFileSync(pathToDB, pathContent);
  return fs.readFileSync('pathToDB.txt', 'utf8');
};

export default new Sequelize({
  dialect: 'sqlite',
  storage: checkForDB(),
});

// export default new Sequelize('joyvetStaging', 'root', '', {
//   dialect: 'mysql',
//   host: 'localhost',
// });

// export default new Sequelize({
//   dialect: 'sqlite',
//   storage: `C:\\Users\\Wemmy\\OneDrive\\Documents\\joyvetDB\\database.sqlite`,
// });

// export default new Sequelize({
//   dialect: 'sqlite',
//   storage: '/Users/wemmyo/Desktop/joyvetDB/database.sqlite',
// });

// /Users/wemmyo/Desktop/joyvetDB
