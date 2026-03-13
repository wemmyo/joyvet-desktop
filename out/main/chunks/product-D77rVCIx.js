"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const Product = database.database.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: { type: Sequelize.STRING, allowNull: false },
  stock: { type: Sequelize.INTEGER, defaultValue: 0 },
  sellPrice: Sequelize.INTEGER,
  sellPrice2: Sequelize.INTEGER,
  sellPrice3: Sequelize.INTEGER,
  buyPrice: Sequelize.INTEGER,
  reorderLevel: Sequelize.INTEGER,
  productCode: Sequelize.STRING,
  numberInPack: Sequelize.INTEGER,
  postedBy: Sequelize.STRING
});
exports.default = Product;
