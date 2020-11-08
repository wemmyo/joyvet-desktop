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
  stock: Sequelize.INTEGER,
  unitPrice: Sequelize.INTEGER,
});

// module.exports = Product;
