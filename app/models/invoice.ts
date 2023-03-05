import sequelize from '../utils/database';
import { ICustomer } from './customer';

const Sequelize = require('sequelize');

// create invoice interface
export interface IInvoice {
  id: number;
  saleType: string;
  amount: number;
  profit: number;
  postedBy: string;
  customerId?: number;
  customer?: ICustomer;
  createdAt?: Date;
  updatedAt?: Date;
}

export default sequelize.define('invoice', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  saleType: { type: Sequelize.STRING, allowNull: false },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  profit: Sequelize.INTEGER,
  postedBy: Sequelize.STRING,
});
