"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const User = database.database.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  fullName: Sequelize.STRING,
  username: { type: Sequelize.STRING, unique: true },
  password: Sequelize.STRING,
  role: Sequelize.STRING
});
exports.default = User;
