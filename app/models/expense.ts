import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('expense', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  date: Sequelize.DATE,
  amount: Sequelize.INTEGER,
  type: Sequelize.STRING,
  note: Sequelize.STRING,
  postedBy: Sequelize.STRING,
});
