import sequelize from '../utils/database';
import type { IInvoice } from './invoice';
import type { IProduct } from './product';

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
  quantity: { type: Sequelize.DOUBLE, allowNull: false },
  unitPrice: { type: Sequelize.DOUBLE, allowNull: false },
  amount: { type: Sequelize.DOUBLE, allowNull: false },
  profit: Sequelize.DOUBLE,
});
