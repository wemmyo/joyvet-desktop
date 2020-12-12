import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('invoice', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  saleType: { type: Sequelize.STRING, allowNull: false },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  unitPrice: { type: Sequelize.INTEGER, allowNull: false },
});
