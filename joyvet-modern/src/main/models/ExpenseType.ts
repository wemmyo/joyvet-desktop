import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface ExpenseType {
  id: number;
  type: string;
}

class ExpenseTypeModel extends Model<ExpenseType> implements ExpenseType {
  public id!: number;
  public type!: string;
}

ExpenseTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'expenseType',
    timestamps: false,
  }
);

export default ExpenseTypeModel;
