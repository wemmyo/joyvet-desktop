import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create invoiceItem interface
export interface InvoiceItem {
  id: number;
  quantity: number;
  unitPrice: number;
  amount: number;
  profit: number;
}

export default sequelize.define('invoiceItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: { type: Sequelize.INTEGER, allowNull: false },
  unitPrice: { type: Sequelize.INTEGER, allowNull: false },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  profit: Sequelize.INTEGER,
});
