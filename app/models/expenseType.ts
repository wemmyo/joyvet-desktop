import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('expenseType', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: Sequelize.STRING,
});
