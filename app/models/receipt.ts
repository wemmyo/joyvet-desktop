import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('receipt', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: { type: Sequelize.INTEGER, allowNull: false },
  note: Sequelize.STRING,
});
