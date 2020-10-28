const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('purchaseItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: Sequelize.INTEGER,
});
