import sequelize from '../utils/database';
import { IProduct } from './product';
import { IPurchase } from './purchase';

const Sequelize = require('sequelize');

// create purchaseItem interface
export interface PurchaseItem {
  id: number;
  quantity: number;
  unitPrice: number;
  amount: number;
  sellPrice: number;
  sellPrice2: number;
  sellPrice3: number;
  oldBuyPrice: number;
  oldSellPrice: number;
  oldSellPrice2: number;
  oldSellPrice3: number;
  oldStockLevel: number;
  purchaseId?: number;
  productId?: number;
  purchase?: IPurchase;
  product?: IProduct;
  createdAt?: Date;
  updatedAt?: Date;
}

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
