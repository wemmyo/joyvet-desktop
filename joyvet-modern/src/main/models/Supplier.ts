import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface ISupplier {
  id: number;
  fullName: string;
  address: string;
  phoneNumber: string;
  balance: number;
  postedBy: string;
}

class Supplier extends Model<ISupplier> implements ISupplier {
  public id!: number;
  public fullName!: string;
  public address!: string;
  public phoneNumber!: string;
  public balance!: number;
  public postedBy!: string;
}

Supplier.init(
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
  },
  {
    sequelize,
    tableName: 'supplier',
    timestamps: false,
  }
);

export default Supplier;
