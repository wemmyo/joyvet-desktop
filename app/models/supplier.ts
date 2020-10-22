const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('supplier', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fullName: Sequelize.STRING,
  address: Sequelize.STRING,
  phoneNumber: Sequelize.STRING,
  balance: Sequelize.DOUBLE,
});
