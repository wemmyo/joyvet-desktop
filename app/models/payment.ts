import sequelize from '../utils/database';
import { ISupplier } from './supplier';

const Sequelize = require('sequelize');

// create expense interface
export interface IPayment {
  id: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  bank: string;
  note: string;
  postedBy: string;
  supplierId?: number;
  supplier?: ISupplier;
  createdAt?: Date;
  updatedAt?: Date;
}

export default sequelize.define('payment', {
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
