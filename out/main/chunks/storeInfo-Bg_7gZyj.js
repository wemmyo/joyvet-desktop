"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const StoreInfo = database.database.define(
  "storeInfo",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    storeName: Sequelize.STRING,
    address: Sequelize.STRING,
    phoneNumber: Sequelize.STRING
  },
  {
    timestamps: false
  }
);
exports.default = StoreInfo;
