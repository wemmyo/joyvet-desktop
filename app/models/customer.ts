const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('customer', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fullName: { type: Sequelize.STRING, allowNull: true },
  address: { type: Sequelize.STRING, allowNull: true },
  phoneNumber: { type: Sequelize.STRING, allowNull: true },
  balance: { type: Sequelize.DOUBLE, allowNull: true },
});
