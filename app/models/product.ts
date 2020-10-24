const Sequelize = require('sequelize');

// const sequelize = require('../utils/database');
import sequelize from '../utils/database';

export default sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  stock: Sequelize.INTEGER,
  unitPrice: Sequelize.INTEGER,
});

// module.exports = Product;
