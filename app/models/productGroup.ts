const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define('productGroup', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
});
