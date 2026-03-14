"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const payment = require("./payment-9-9dtC0H.js");
const supplier = require("./supplier-CIPjGeuJ.js");
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
const getPayments = (args) => {
  return payment.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
function registerPaymentHandlers() {
  electron.ipcMain.handle("payment:getAll", async () => {
    const payments = await getPayments({});
    return payments.map((p) => p.toJSON ? p.toJSON() : p);
  });
  electron.ipcMain.handle("payment:create", async (_event, values) => {
    const schema = zod.z.object({
      values: zod.z.object({
        amount: zod.z.number().min(1),
        supplierId: zod.z.number(),
        paymentMethod: zod.z.string().min(1),
        bank: zod.z.string()
      })
    });
    schema.parse({ values });
    await database.database.transaction(async (t) => {
      const payment$1 = await payment.default.create(
        {
          supplierId: values.supplierId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null
        },
        { transaction: t }
      );
      await supplier.default.decrement("balance", {
        by: values.amount,
        where: { id: values.supplierId },
        transaction: t
      });
      return payment$1.toJSON ? payment$1.toJSON() : payment$1;
    });
  });
  electron.ipcMain.handle("payment:delete", async (_event, id) => {
    const schema = zod.z.object({ id: zod.z.number() });
    schema.parse({ id });
    await database.database.transaction(async (t) => {
      const payment$1 = await payment.default.findByPk(id, { transaction: t });
      if (!payment$1) throw new Error("Payment not found");
      await supplier.default.increment("balance", {
        by: payment$1.amount,
        where: { id: payment$1.supplierId },
        transaction: t
      });
      await payment$1.destroy({ transaction: t });
    });
  });
  electron.ipcMain.handle(
    "payment:filter",
    async (_event, startDate, endDate, supplierId) => {
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.createdAt = {
          [sequelize.Op.between]: [
            `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
            `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`
          ]
        };
      }
      if (supplierId) {
        whereClause.supplierId = supplierId;
      }
      const payments = await getPayments({
        where: Object.keys(whereClause).length ? whereClause : void 0,
        order: [["createdAt", "DESC"]]
      });
      return payments.map((p) => p.toJSON ? p.toJSON() : p);
    }
  );
}
exports.registerPaymentHandlers = registerPaymentHandlers;
