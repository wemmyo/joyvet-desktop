import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('payment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  paymentType: Sequelize.STRING,
  paymentMethod: Sequelize.STRING,
  bank: Sequelize.STRING,
  note: Sequelize.STRING,
  postedBy: Sequelize.STRING,
});
