import sequelize from '../utils/database';
import { IInvoice } from './invoice';
import { IProduct } from './product';

const Sequelize = require('sequelize');

// create invoiceItem interface
export interface IInvoiceItem {
  id: number;
  quantity: number;
  unitPrice: number;
  amount: number;
  profit: number;
  invoiceId?: number;
  productId?: number;
  invoice?: IInvoice;
  product?: IProduct;
  createdAt?: Date;
  updatedAt?: Date;
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
