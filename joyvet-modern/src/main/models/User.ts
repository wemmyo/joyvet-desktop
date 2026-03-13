import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface IUser {
  id: number;
  fullName: string;
  username: string;
  password: string;
  role: string;
}

class User extends Model<IUser> implements IUser {
  public id!: number;
  public fullName!: string;
  public username!: string;
  public password!: string;
  public role!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user',
    timestamps: false,
  }
);

export default User;
