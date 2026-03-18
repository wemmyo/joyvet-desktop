"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const Customer = database.database.define(
  "customer",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: { type: Sequelize.STRING, allowNull: false },
    address: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
    balance: Sequelize.DOUBLE,
    postedBy: Sequelize.STRING,
    maxPriceLevel: Sequelize.INTEGER
  },
  {
    timestamps: false
  }
);
exports.default = Customer;
