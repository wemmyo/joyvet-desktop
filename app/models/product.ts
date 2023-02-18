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

export default sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: { type: Sequelize.STRING, allowNull: false },
  stock: { type: Sequelize.INTEGER, defaultValue: 0 },
  sellPrice: Sequelize.INTEGER,
  sellPrice2: Sequelize.INTEGER,
  sellPrice3: Sequelize.INTEGER,
  buyPrice: Sequelize.INTEGER,
  reorderLevel: Sequelize.INTEGER,
  productCode: Sequelize.STRING,
  numberInPack: Sequelize.INTEGER,
  postedBy: Sequelize.STRING,
});

// module.exports = Product;
