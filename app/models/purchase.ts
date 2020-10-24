const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('purchase', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  unitPrice: Sequelize.INTEGER,
  quantity: Sequelize.INTEGER,
  invoiceNumber: Sequelize.STRING,
  invoiceDate: Sequelize.DATE,
});
