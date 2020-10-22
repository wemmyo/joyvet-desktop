const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('purchase', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  price: Sequelize.INTEGER,
  quantity: Sequelize.INTEGER,
});
