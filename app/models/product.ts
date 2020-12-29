import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: { type: Sequelize.STRING, allowNull: false },
  stock: { type: Sequelize.INTEGER, defaultValue: 0 },
  price1: Sequelize.INTEGER,
  price2: Sequelize.INTEGER,
  price3: Sequelize.INTEGER,
  price4: Sequelize.INTEGER,
});

// module.exports = Product;
