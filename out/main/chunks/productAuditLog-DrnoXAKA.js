"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const ProductAuditLog = database.database.define("productAuditLog", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  productId: { type: Sequelize.INTEGER, allowNull: false },
  changeType: { type: Sequelize.STRING, allowNull: false },
  delta: Sequelize.INTEGER,
  stockBefore: Sequelize.INTEGER,
  stockAfter: Sequelize.INTEGER,
  priceChanges: Sequelize.TEXT,
  reason: { type: Sequelize.STRING, allowNull: false },
  referenceId: Sequelize.INTEGER,
  referenceType: Sequelize.STRING,
  postedBy: { type: Sequelize.STRING, allowNull: false }
});
exports.default = ProductAuditLog;
