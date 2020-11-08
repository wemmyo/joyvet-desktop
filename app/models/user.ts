import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  isAdmin: Sequelize.BOOLEAN,
  isManager: Sequelize.BOOLEAN,
});
