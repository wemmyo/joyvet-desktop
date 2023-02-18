import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create expense interface
export interface Expense {
  id: number;
  date: Date;
  amount: number;
  type: string;
  note: string;
  postedBy: string;
}

export default sequelize.define('payment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  paymentType: Sequelize.STRING,
  paymentMethod: Sequelize.STRING,
  bank: Sequelize.STRING,
  note: Sequelize.STRING,
  postedBy: Sequelize.STRING,
});
