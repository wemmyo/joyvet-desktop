"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const receipt = require("./receipt-CgVNnpBY.js");
const customer = require("./customer-CS2lwHZV.js");
const database = require("./database-Dx0B-evc.js");
const receipt_service = require("./receipt.service-DcZJQlU4.js");
const listing = require("./listing-fG59YslC.js");
const index = require("../index.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const receiptInputSchema = zod.z.object({
  amount: zod.z.number().min(1),
  customerId: zod.z.number(),
  paymentMethod: zod.z.string().min(1),
  bank: zod.z.string().optional().nullable(),
  note: zod.z.string().optional().nullable()
});
const receiptUpdateSchema = zod.z.object({
  amount: zod.z.number().min(1),
  customerId: zod.z.number(),
  paymentMethod: zod.z.string().min(1).optional(),
  bank: zod.z.string().optional().nullable(),
  note: zod.z.string().optional().nullable()
});
function registerReceiptHandlers() {
  electron.ipcMain.handle(
    "receipt:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.receiptListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await receipt.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        include: [{ model: customer.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((receipt2) => receipt2.toJSON ? receipt2.toJSON() : receipt2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "receipt:getById",
    index.withAppReady(async (_event, id) => {
      zod.z.number().parse(id);
      const receipt$1 = await receipt_service.getReceiptById(id);
      if (!receipt$1) {
        throw new Error("Receipt not found");
      }
      const hydratedReceipt = await receipt.default.findByPk(id, {
        include: [{ model: customer.default }]
      });
      return hydratedReceipt && hydratedReceipt.toJSON ? hydratedReceipt.toJSON() : hydratedReceipt;
    })
  );
  electron.ipcMain.handle(
    "receipt:create",
    index.withAppReady(async (_event, values) => {
      const parsedValues = receiptInputSchema.parse(values);
      await database.database.transaction(async (t) => {
        const receipt$1 = await receipt.default.create(
          {
            customerId: parsedValues.customerId,
            amount: parsedValues.amount,
            paymentMethod: parsedValues.paymentMethod,
            bank: parsedValues.bank || null,
            note: parsedValues.note || null,
            postedBy: values.postedBy || null
          },
          { transaction: t }
        );
        await customer.default.decrement("balance", {
          by: parsedValues.amount,
          where: { id: parsedValues.customerId },
          transaction: t
        });
        return receipt$1.toJSON ? receipt$1.toJSON() : receipt$1;
      });
    })
  );
  electron.ipcMain.handle(
    "receipt:update",
    index.withAppReady(async (_event, id, values) => {
      zod.z.number().parse(id);
      const parsedValues = receiptUpdateSchema.parse(values);
      await database.database.transaction(async (t) => {
        const receipt$1 = await receipt.default.findByPk(id, { transaction: t });
        if (!receipt$1) {
          throw new Error("Receipt not found");
        }
        await customer.default.increment("balance", {
          by: receipt$1.amount,
          where: { id: receipt$1.customerId },
          transaction: t
        });
        await customer.default.decrement("balance", {
          by: parsedValues.amount,
          where: { id: parsedValues.customerId },
          transaction: t
        });
        await receipt_service.updateReceipt(
          id,
          {
            ...parsedValues,
            paymentMethod: parsedValues.paymentMethod || receipt$1.paymentMethod,
            bank: parsedValues.bank || receipt$1.bank || void 0,
            note: parsedValues.note || void 0
          },
          t
        );
      });
    })
  );
  electron.ipcMain.handle(
    "receipt:delete",
    index.withAppReady(async (_event, id) => {
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
    })
  );
  electron.ipcMain.handle(
    "receipt:filter",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.receiptListQuerySchema.parse(input);
      const { customerId, endDate, page, pageSize, startDate } = query;
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.createdAt = {
          [sequelize.Op.between]: [
            `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
            `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`
          ]
        };
      }
      if (customerId) {
        whereClause.customerId = customerId;
      }
      const { rows, count } = await receipt.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length ? whereClause : void 0,
        include: [{ model: customer.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((receipt2) => receipt2.toJSON ? receipt2.toJSON() : receipt2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "receipt:search",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.receiptListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      const receiptId = Number(search);
      if (!search || Number.isNaN(receiptId)) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const { rows, count } = await receipt.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: { id: receiptId },
        include: [{ model: customer.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((receipt2) => receipt2.toJSON ? receipt2.toJSON() : receipt2),
        count,
        page,
        pageSize
      );
    })
  );
}
exports.registerReceiptHandlers = registerReceiptHandlers;
