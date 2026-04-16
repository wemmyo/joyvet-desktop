import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export interface IInvoiceAuditLog {
  id: number;
  invoiceId: number | null;
  action:
    | 'created'
    | 'deleted'
    | 'item_added'
    | 'item_deleted'
    | 'item_updated';
  details: string | null; // JSON
  performedBy: string;
  createdAt?: Date;
}

export default sequelize.define(
  'invoiceAuditLog',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    invoiceId: { type: Sequelize.INTEGER, allowNull: true },
    action: { type: Sequelize.STRING, allowNull: false },
    details: { type: Sequelize.TEXT, allowNull: true },
    performedBy: { type: Sequelize.STRING, allowNull: false },
  },
  {
    updatedAt: false,
  }
);
