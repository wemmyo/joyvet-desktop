import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface ICustomer {
  id: number;
  fullName: string;
  address: string;
  phoneNumber: string;
  balance: number;
  postedBy: string;
  maxPriceLevel: number;
}

class Customer extends Model<ICustomer> implements ICustomer {
  public id!: number;
  public fullName!: string;
  public address!: string;
  public phoneNumber!: string;
  public balance!: number;
  public postedBy!: string;
  public maxPriceLevel!: number;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    postedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maxPriceLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'customer',
    timestamps: false,
  }
);

export default Customer;
