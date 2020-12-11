import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('priceLevel', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  price1: Sequelize.INTEGER,
  price2: Sequelize.INTEGER,
  price3: Sequelize.INTEGER,
  price4: Sequelize.INTEGER,
});
