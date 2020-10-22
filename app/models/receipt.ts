const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('receipt', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amountPaid: Sequelize.INTEGER,
});
