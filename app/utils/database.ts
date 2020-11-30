const Sequelize = require('sequelize');

// export default new Sequelize('joyvetStaging', 'root', '', {
//   dialect: 'mysql',
//   host: 'localhost',
// });

// export default new Sequelize({
//   dialect: 'sqlite',
//   storage: `C:\\Users\\Wemmy\\OneDrive\\Documents\\joyvetDB\\database.sqlite`,
// });

export default new Sequelize({
  dialect: 'sqlite',
  storage: '/Users/wemmyo/Desktop/joyvetDB/database.sqlite',
});

// /Users/wemmyo/Desktop/joyvetDB
