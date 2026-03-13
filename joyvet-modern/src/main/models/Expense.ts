import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IExpense {
  id: number;
  date: Date;
  amount: number;
  type: string;
  note: string;
  postedBy: string;
}

class Expense extends Model<IExpense> implements IExpense {
  public id!: number;
  public date!: Date;
  public amount!: number;
  public type!: string;
  public note!: string;
  public postedBy!: string;
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'expense',
    timestamps: false,
  }
);

export default Expense;
