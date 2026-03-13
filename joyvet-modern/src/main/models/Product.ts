import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IProduct {
  id: number;
  title: string;
  stock: number;
  sellPrice: number;
  sellPrice2: number;
  sellPrice3: number;
  buyPrice: number;
  reorderLevel: number;
  productCode: string;
  numberInPack: number;
  postedBy: string;
}

class Product extends Model<IProduct> implements IProduct {
  public id!: number;
  public title!: string;
  public stock!: number;
  public sellPrice!: number;
  public sellPrice2!: number;
  public sellPrice3!: number;
  public buyPrice!: number;
  public reorderLevel!: number;
  public productCode!: string;
  public numberInPack!: number;
  public postedBy!: string;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    buyPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numberInPack: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    postedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'product',
    timestamps: false,
  }
);

export default Product;
