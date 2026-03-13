import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IReceipt {
  id: number;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  bank: string;
  note: string;
  postedBy: string;
}

class Receipt extends Model<IReceipt> implements IReceipt {
  public id!: number;
  public amount!: number;
  public paymentType!: string;
  public paymentMethod!: string;
  public bank!: string;
  public note!: string;
  public postedBy!: string;
}

Receipt.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'receipt',
    timestamps: false,
  }
);

export default Receipt;
