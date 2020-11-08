import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('invoiceItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: { type: Sequelize.INTEGER, allowNull: false },
});
