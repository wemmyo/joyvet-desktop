import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create expenseType interface
export interface ExpenseType {
  id: number;
  type: string;
}

export default sequelize.define('expenseType', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: Sequelize.STRING,
});
