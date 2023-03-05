import sequelize from '../utils/database';
import { ICustomer } from './customer';

const Sequelize = require('sequelize');

// create receipt interface
export interface IReceipt {
  id: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  bank: string;
  note: string;
  postedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  customerId?: number;
  customer?: ICustomer;
}

export default sequelize.define('receipt', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  paymentType: Sequelize.STRING,
  paymentMethod: Sequelize.STRING,
  bank: Sequelize.STRING,
  note: Sequelize.STRING,
  postedBy: Sequelize.STRING,
});
