import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create expense interface
export interface IExpense {
  id: number;
  date: Date;
  amount: number;
  type: string;
  note: string;
  postedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default sequelize.define('expense', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  date: Sequelize.DATE,
  amount: Sequelize.INTEGER,
  type: Sequelize.STRING,
  note: Sequelize.STRING,
  postedBy: Sequelize.STRING,
});
