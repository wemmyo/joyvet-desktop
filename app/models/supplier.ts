import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create supplier interface
export interface Supplier {
  id: number;
  fullName: string;
  address: string;
  phoneNumber: string;
  balance: number;
  postedBy: string;
}

export default sequelize.define(
  'supplier',
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
  },
  {
    timestamps: false,
  }
);
