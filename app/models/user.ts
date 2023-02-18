import sequelize from '../utils/database';

const Sequelize = require('sequelize');

// create user interface
export interface User {
  id: number;
  fullName: string;
  username: string;
  password: string;
  role: string;
}

export default sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fullName: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  role: Sequelize.STRING,
});
