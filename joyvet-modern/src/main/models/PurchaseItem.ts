import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IPurchaseItem {
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
}

class PurchaseItem extends Model<IPurchaseItem> implements IPurchaseItem {
  public id!: number;
  public quantity!: number;
  public unitPrice!: number;
  public amount!: number;
  public sellPrice!: number;
  public sellPrice2!: number;
  public sellPrice3!: number;
  public oldBuyPrice!: number;
  public oldSellPrice!: number;
  public oldSellPrice2!: number;
  public oldSellPrice3!: number;
  public oldStockLevel!: number;
}

PurchaseItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sellPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sellPrice2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sellPrice3: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    oldBuyPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    oldSellPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    oldSellPrice2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    oldSellPrice3: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    oldStockLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'purchaseItem',
    timestamps: false,
  }
);

export default PurchaseItem;
