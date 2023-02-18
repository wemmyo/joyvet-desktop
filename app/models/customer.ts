import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create customer interface
export interface Customer {
  id: number;
  fullName: string;
  address: string;
  phoneNumber: string;
  balance: number;
  postedBy: string;
  maxPriceLevel: number;
}

export default sequelize.define(
  'customer',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    fullName: { type: Sequelize.STRING, allowNull: false },
    address: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
    balance: Sequelize.DOUBLE,
    postedBy: Sequelize.STRING,
    maxPriceLevel: Sequelize.INTEGER,
  },
  {
    timestamps: false,
  }
);
