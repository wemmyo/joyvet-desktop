import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('purchase', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  invoiceNumber: Sequelize.STRING,
  invoiceDate: Sequelize.DATE,
  amount: { type: Sequelize.INTEGER, allowNull: false },
});
