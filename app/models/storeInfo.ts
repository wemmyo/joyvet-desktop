import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export interface IStoreInfo {
  id: number;
  storeName: string;
  address: string;
  phoneNumber: string;
}

export default sequelize.define(
  'storeInfo',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    storeName: Sequelize.STRING,
    address: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);
