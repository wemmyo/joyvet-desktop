import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create purchase interface
export interface Purchase {
  id: number;
  invoiceNumber: string;
  amount: number;
  postedBy: string;
}

export default sequelize.define('purchase', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  invoiceNumber: Sequelize.STRING,
  amount: { type: Sequelize.INTEGER, allowNull: false },
  postedBy: Sequelize.STRING,
});
