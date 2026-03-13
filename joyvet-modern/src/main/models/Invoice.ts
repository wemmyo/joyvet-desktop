import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IInvoice {
  id: number;
  saleType: string;
  amount: number;
  profit: number;
  postedBy: string;
}

class Invoice extends Model<IInvoice> implements IInvoice {
  public id!: number;
  public saleType!: string;
  public amount!: number;
  public profit!: number;
  public postedBy!: string;
}

Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    saleType: {
      type: DataTypes.STRING,
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
    postedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'invoice',
    timestamps: false,
  }
);

export default Invoice;
