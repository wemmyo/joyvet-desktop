import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export interface IProductAuditLog {
  id: number;
  productId: number;
  changeType: 'stock_change' | 'price_change' | 'details_change';
  delta: number | null;
  stockBefore: number | null;
  stockAfter: number | null;
  priceChanges: string | null; // JSON: { field, before, after }[]
  reason:
    | 'invoice_create'
    | 'invoice_delete'
    | 'purchase_create'
    | 'purchase_delete'
    | 'purchase_update'
    | 'invoice_add_item'
    | 'invoice_delete_item'
    | 'invoice_update_item'
    | 'manual_edit';
  referenceId: number | null;
  referenceType: 'invoice' | 'purchase' | 'manual' | null;
  postedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default sequelize.define('productAuditLog', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  productId: { type: Sequelize.INTEGER, allowNull: false },
  changeType: { type: Sequelize.STRING, allowNull: false },
  delta: Sequelize.INTEGER,
  stockBefore: Sequelize.INTEGER,
  stockAfter: Sequelize.INTEGER,
  priceChanges: Sequelize.TEXT,
  reason: { type: Sequelize.STRING, allowNull: false },
  referenceId: Sequelize.INTEGER,
  referenceType: Sequelize.STRING,
  postedBy: { type: Sequelize.STRING, allowNull: false },
});
