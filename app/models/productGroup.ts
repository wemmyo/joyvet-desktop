import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('productGroup', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
});
