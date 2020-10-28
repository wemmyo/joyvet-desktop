const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('invoice', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  saleType: Sequelize.STRING,
  amount: Sequelize.INTEGER,
});
