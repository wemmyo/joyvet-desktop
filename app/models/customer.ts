const Sequelize = require('sequelize');

import sequelize from '../utils/database';

export default sequelize.define(
  'customer',
  {
    cust_id: {
      type: Sequelize.DOUBLE,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    cust_company_name: Sequelize.STRING,
    address: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    e_mail: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    web_site: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    birthdate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    business_type: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    current_balance: {
      type: Sequelize.DOUBLE,
      allowNull: false,
    },
    cust_type_code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    current_balance_date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    contact_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    acct_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    telephone_no: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    cust_since: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    assigned_new: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    credit_limit: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    branch_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
    tableName: 'customer',
  }
);

// module.exports = Product;
