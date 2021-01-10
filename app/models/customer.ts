import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define(
  'customer',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    fullName: { type: Sequelize.STRING, allowNull: false },
    address: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
    balance: Sequelize.DOUBLE,
    postedBy: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);
