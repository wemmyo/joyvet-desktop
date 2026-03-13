import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IPurchase {
  id: number;
  invoiceNumber: string;
  amount: number;
  postedBy: string;
}

class Purchase extends Model<IPurchase> implements IPurchase {
  public id!: number;
  public invoiceNumber!: string;
  public amount!: number;
  public postedBy!: string;
}

Purchase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'purchase',
    timestamps: false,
  }
);

export default Purchase;
