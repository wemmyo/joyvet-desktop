"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const ExpenseType = database.database.define("expenseType", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  type: Sequelize.STRING
});
exports.default = ExpenseType;
