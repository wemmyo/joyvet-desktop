import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IInvoiceItem {
  id: number;
  quantity: number;
  unitPrice: number;
  amount: number;
  profit: number;
}

class InvoiceItem extends Model<IInvoiceItem> implements IInvoiceItem {
  public id!: number;
  public quantity!: number;
  public unitPrice!: number;
  public amount!: number;
  public profit!: number;
}

InvoiceItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    profit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'invoiceItem',
    timestamps: false,
  }
);

export default InvoiceItem;
