"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const payment = require("./payment-9-9dtC0H.js");
const supplier = require("./supplier-D6HH6Jzr.js");
const database = require("./database-Dx0B-evc.js");
const listing = require("./listing-fG59YslC.js");
const index = require("../index.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const getPaymentById = (id, args) => {
  return payment.default.findByPk(id, {
    ...args
  }).then((data) => {
    return data;
  });
};
const updatePayment = (id, payment$1, transaction) => {
  return payment.default.update(payment$1, {
    where: {
      id
    },
    transaction
  }).then((data) => {
    return data;
  });
};
const paymentInputSchema = zod.z.object({
  amount: zod.z.number().min(1),
  supplierId: zod.z.number(),
  paymentMethod: zod.z.string().min(1).optional(),
  bank: zod.z.string().optional().nullable(),
  note: zod.z.string().optional().nullable()
});
function registerPaymentHandlers() {
  electron.ipcMain.handle(
    "payment:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.paymentListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await payment.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        include: [{ model: supplier.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((payment2) => payment2.toJSON ? payment2.toJSON() : payment2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "payment:getById",
    index.withAppReady(async (_event, id) => {
      zod.z.number().parse(id);
      const payment2 = await getPaymentById(id, {
        include: [{ model: supplier.default }]
      });
      if (!payment2) {
        throw new Error("Payment not found");
      }
      return payment2.toJSON ? payment2.toJSON() : payment2;
    })
  );
  electron.ipcMain.handle(
    "payment:create",
    index.withAppReady(async (_event, values) => {
      const parsedValues = paymentInputSchema.parse(values);
      await database.database.transaction(async (t) => {
        const payment$1 = await payment.default.create(
          {
            supplierId: parsedValues.supplierId,
            amount: parsedValues.amount,
            paymentMethod: parsedValues.paymentMethod || null,
            bank: parsedValues.bank || null,
            note: parsedValues.note || null,
            postedBy: values.postedBy || null
          },
          { transaction: t }
        );
        await supplier.default.decrement("balance", {
          by: parsedValues.amount,
          where: { id: parsedValues.supplierId },
          transaction: t
        });
        return payment$1.toJSON ? payment$1.toJSON() : payment$1;
      });
    })
  );
  electron.ipcMain.handle(
    "payment:update",
    index.withAppReady(async (_event, id, values) => {
      zod.z.number().parse(id);
      const parsedValues = paymentInputSchema.parse(values);
      await database.database.transaction(async (t) => {
        const payment$1 = await payment.default.findByPk(id, { transaction: t });
        if (!payment$1) {
          throw new Error("Payment not found");
        }
        await supplier.default.increment("balance", {
          by: payment$1.amount,
          where: { id: payment$1.supplierId },
          transaction: t
        });
        await supplier.default.decrement("balance", {
          by: parsedValues.amount,
          where: { id: parsedValues.supplierId },
          transaction: t
        });
        await updatePayment(
          id,
          {
            ...parsedValues,
            paymentMethod: parsedValues.paymentMethod || payment$1.paymentMethod,
            bank: parsedValues.bank || payment$1.bank || void 0,
            note: parsedValues.note || void 0
          },
          t
        );
      });
    })
  );
  electron.ipcMain.handle(
    "payment:delete",
    index.withAppReady(async (_event, id) => {
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
    })
  );
  electron.ipcMain.handle(
    "payment:filter",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.paymentListQuerySchema.parse(input);
      const { endDate, page, pageSize, startDate, supplierId } = query;
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
      const { rows, count } = await payment.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length ? whereClause : void 0,
        include: [{ model: supplier.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((payment2) => payment2.toJSON ? payment2.toJSON() : payment2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "payment:search",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.paymentListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      const paymentId = Number(search);
      if (!search || Number.isNaN(paymentId)) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const { rows, count } = await payment.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: { id: paymentId },
        include: [{ model: supplier.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((payment2) => payment2.toJSON ? payment2.toJSON() : payment2),
        count,
        page,
        pageSize
      );
    })
  );
}
exports.registerPaymentHandlers = registerPaymentHandlers;
