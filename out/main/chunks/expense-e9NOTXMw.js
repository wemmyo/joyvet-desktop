"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const Expense = database.database.define("expense", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  date: Sequelize.DATE,
  amount: Sequelize.INTEGER,
  type: Sequelize.STRING,
  note: Sequelize.STRING,
  postedBy: Sequelize.STRING
});
exports.default = Expense;
