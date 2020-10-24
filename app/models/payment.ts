const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('payment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: Sequelize.INTEGER,
  note: Sequelize.STRING,
});
