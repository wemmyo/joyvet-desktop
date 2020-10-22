const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  isAdmin: Sequelize.BOOLEAN,
  isManager: Sequelize.BOOLEAN,
});
