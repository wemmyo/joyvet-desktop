"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const moment = require("moment");
const zod = require("zod");
const receipt = require("./receipt-CgVNnpBY.js");
const customer = require("./customer-DOw70VuU.js");
const database = require("./database-Dx0B-evc.js");
const receipt_service = require("./receipt.service-DSTjl21x.js");
require("fs");
require("path");
function registerReceiptHandlers() {
  electron.ipcMain.handle("receipt:getAll", async () => {
    const receipts = await receipt.default.findAll({
      include: [{ model: customer.default }]
    });
    return receipts.map((r) => r.toJSON ? r.toJSON() : r);
  });
  electron.ipcMain.handle("receipt:create", async (_event, values) => {
    const schema = zod.z.object({
      amount: zod.z.number().min(1),
      customerId: zod.z.number(),
      paymentMethod: zod.z.string().min(1)
    });
    schema.parse(values);
    await database.database.transaction(async (t) => {
      const receipt$1 = await receipt.default.create(
        {
          customerId: values.customerId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null
        },
        { transaction: t }
      );
      await customer.default.decrement("balance", {
        by: values.amount,
        where: { id: values.customerId },
        transaction: t
      });
      return receipt$1.toJSON ? receipt$1.toJSON() : receipt$1;
    });
  });
  electron.ipcMain.handle("receipt:delete", async (_event, id) => {
    const schema = zod.z.object({ id: zod.z.number() });
    schema.parse({ id });
    await database.database.transaction(async (t) => {
      const receipt$1 = await receipt.default.findByPk(id, { transaction: t });
      if (!receipt$1) throw new Error("Receipt not found");
      await customer.default.increment("balance", {
        by: receipt$1.amount,
        where: { id: receipt$1.customerId },
        transaction: t
      });
      await receipt$1.destroy({ transaction: t });
    });
  });
  electron.ipcMain.handle(
    "receipt:filter",
    async (_event, startDate, endDate, customerId) => {
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.createdAt = {
          [sequelize.Op.between]: [
            `${moment(startDate).format("YYYY-MM-DD")} 00:00:00`,
            `${moment(endDate).format("YYYY-MM-DD")} 23:59:59`
          ]
        };
      }
      if (customerId) {
        whereClause.customerId = customerId;
      }
      const receipts = await receipt_service.getReceipts({
        where: Object.keys(whereClause).length ? whereClause : void 0,
        include: [{ model: customer.default }],
        order: [["createdAt", "DESC"]]
      });
      return receipts.map((r) => r.toJSON ? r.toJSON() : r);
    }
  );
}
exports.registerReceiptHandlers = registerReceiptHandlers;
