import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IStoreInfo {
  id: number;
  storeName: string;
  address: string;
  phoneNumber: string;
}

class StoreInfo extends Model<IStoreInfo> implements IStoreInfo {
  public id!: number;
  public storeName!: string;
  public address!: string;
  public phoneNumber!: string;
}

StoreInfo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'storeInfo',
    timestamps: false,
  }
);

export default StoreInfo;
