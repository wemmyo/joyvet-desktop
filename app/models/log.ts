import sequelize from '../utils/database';

const Sequelize = require('sequelize');

export default sequelize.define('log', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  description: { type: Sequelize.INTEGER, allowNull: false },
  crudType: { type: Sequelize.INTEGER, allowNull: false },
});
