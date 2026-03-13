"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const Purchase = database.database.define("purchase", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  invoiceNumber: Sequelize.STRING,
  amount: { type: Sequelize.INTEGER, allowNull: false },
  postedBy: Sequelize.STRING
});
exports.default = Purchase;
