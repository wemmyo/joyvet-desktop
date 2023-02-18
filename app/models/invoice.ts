import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create invoice interface
export interface Invoice {
  id: number;
  saleType: string;
  amount: number;
  profit: number;
  postedBy: string;
}

export default sequelize.define('invoice', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  saleType: { type: Sequelize.STRING, allowNull: false },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  profit: Sequelize.INTEGER,
  postedBy: Sequelize.STRING,
});
