"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron");
const Sequelize = require("sequelize");
const InvoiceAuditLog = database.database.define(
  "invoiceAuditLog",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    invoiceId: { type: Sequelize.INTEGER, allowNull: true },
    action: { type: Sequelize.STRING, allowNull: false },
    details: { type: Sequelize.TEXT, allowNull: true },
    performedBy: { type: Sequelize.STRING, allowNull: false }
  },
  {
    updatedAt: false
  }
);
exports.default = InvoiceAuditLog;
