import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('purchaseItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: { type: Sequelize.INTEGER, allowNull: false },
  unitPrice: { type: Sequelize.INTEGER, allowNull: false },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  sellPrice: Sequelize.INTEGER,
  sellPrice2: Sequelize.INTEGER,
  sellPrice3: Sequelize.INTEGER,
  oldBuyPrice: Sequelize.INTEGER,
  oldSellPrice: Sequelize.INTEGER,
  oldSellPrice2: Sequelize.INTEGER,
  oldSellPrice3: Sequelize.INTEGER,
  oldStockLevel: Sequelize.INTEGER,
});
