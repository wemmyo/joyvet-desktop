import sequelize from '../utils/database';
import { ISupplier } from './supplier';

const Sequelize = require('sequelize');

// create purchase interface
export interface IPurchase {
  id: number;
  invoiceNumber: string;
  amount: number;
  postedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  supplierId: number;
  supplier?: ISupplier;
}

export default sequelize.define('purchase', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  invoiceNumber: Sequelize.STRING,
  amount: { type: Sequelize.INTEGER, allowNull: false },
  postedBy: Sequelize.STRING,
});
