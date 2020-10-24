// const mysql = require('mysql2');

// export default mysql
//   .createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: '',
//   })
//   .promise();

const Sequelize = require('sequelize');

export default new Sequelize('joyvetStaging', 'root', '', {
  dialect: 'mysql',
  host: 'localhost',
});

// module.exports = sequelize;
