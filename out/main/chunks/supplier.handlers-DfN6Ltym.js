"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const supplier = require("./supplier-D6HH6Jzr.js");
const payment = require("./payment-9-9dtC0H.js");
const purchase = require("./purchase-BlBXNXRZ.js");
const product = require("./product-D77rVCIx.js");
const listing = require("./listing-fG59YslC.js");
const index = require("../index.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const getSupplierById = (id) => {
  return supplier.default.findByPk(id, {}).then((data) => {
    return data;
  });
};
const updateSupplier = (id, supplier$1) => {
  return supplier.default.update(supplier$1, {
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const deleteSupplier = (id) => {
  return supplier.default.destroy({
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const createSupplier = (supplier$1) => {
  return supplier.default.create(supplier$1).then((data) => {
    return data;
  });
};
function registerSupplierHandlers() {
  electron.ipcMain.handle(
    "supplier:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.searchPaginationSchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await supplier.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        order: [["fullName", "ASC"]]
      });
      return listing.toPaginatedResult(
        rows.map((supplier2) => supplier2.toJSON ? supplier2.toJSON() : supplier2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "supplier:getById",
    index.withAppReady(async (_event, id) => {
      const supplier2 = await getSupplierById(id);
      return supplier2.toJSON ? supplier2.toJSON() : supplier2;
    })
  );
  electron.ipcMain.handle(
    "supplier:create",
    index.withAppReady(async (_event, values) => {
      const schema = zod.z.object({
        fullName: zod.z.string().min(1),
        phoneNumber: zod.z.string(),
        address: zod.z.string()
      });
      schema.parse(values);
      const supplier2 = await createSupplier({ ...values });
      return supplier2.toJSON ? supplier2.toJSON() : supplier2;
    })
  );
  electron.ipcMain.handle(
    "supplier:update",
    index.withAppReady(async (_event, id, values) => {
      const schema = zod.z.object({
        id: zod.z.number(),
        fullName: zod.z.string().min(1),
        phoneNumber: zod.z.string(),
        address: zod.z.string()
      });
      schema.parse({ ...values, id });
      await updateSupplier(id, values);
    })
  );
  electron.ipcMain.handle(
    "supplier:delete",
    index.withAppReady(async (_event, id) => {
      await deleteSupplier(id);
    })
  );
  electron.ipcMain.handle(
    "supplier:search",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.searchPaginationSchema.parse(input);
      const { page, pageSize, search } = query;
      if (!search) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const { rows, count } = await supplier.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        where: { fullName: { [sequelize.Op.substring]: search } },
        order: [["fullName", "ASC"]]
      });
      return listing.toPaginatedResult(
        rows.map((supplier2) => supplier2.toJSON ? supplier2.toJSON() : supplier2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "payment:getBySupplier",
    index.withAppReady(async (_event, supplierId, startDate, endDate) => {
      const schema = zod.z.object({
        supplierId: zod.z.number(),
        startDate: zod.z.string(),
        endDate: zod.z.string()
      });
      schema.parse({ supplierId, startDate, endDate });
      const payments = await payment.default.findAll({
        where: {
          supplierId,
          createdAt: {
            [sequelize.Op.between]: [
              `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${dayjs(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        },
        order: [["createdAt", "DESC"]]
      });
      return payments.map((p) => p.toJSON ? p.toJSON() : p);
    })
  );
  electron.ipcMain.handle(
    "purchase:getBySupplier",
    index.withAppReady(async (_event, supplierId, startDate, endDate) => {
      const schema = zod.z.object({
        supplierId: zod.z.number(),
        startDate: zod.z.string(),
        endDate: zod.z.string()
      });
      schema.parse({ supplierId, startDate, endDate });
      const purchases = await purchase.default.findAll({
        where: {
          supplierId,
          createdAt: {
            [sequelize.Op.between]: [
              `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${dayjs(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        },
        order: [["createdAt", "DESC"]]
      });
      return purchases.map((p) => p.toJSON ? p.toJSON() : p);
    })
  );
  electron.ipcMain.handle(
    "supplier:getActivityTimeline",
    index.withAppReady(
      async (_event, supplierId, startDate, endDate) => {
        const startStr = `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`;
        const endStr = `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`;
        const purchaseSumBefore = await purchase.default.sum("amount", {
          where: {
            supplierId,
            createdAt: { [sequelize.Op.lt]: startStr }
          }
        }) || 0;
        const paymentSumBefore = await payment.default.sum("amount", {
          where: {
            supplierId,
            createdAt: { [sequelize.Op.lt]: startStr }
          }
        }) || 0;
        const balanceAtStart = purchaseSumBefore - paymentSumBefore;
        const dateRange = { [sequelize.Op.between]: [startStr, endStr] };
        const [purchases, payments] = await Promise.all([
          purchase.default.findAll({
            where: { supplierId, createdAt: dateRange },
            include: [{ model: product.default }],
            order: [["createdAt", "ASC"]]
          }),
          payment.default.findAll({
            where: { supplierId, createdAt: dateRange },
            order: [["createdAt", "ASC"]]
          })
        ]);
        const timeline = [
          ...purchases.map((p) => ({
            ...p.toJSON ? p.toJSON() : p,
            _type: "purchase"
          })),
          ...payments.map((p) => ({
            ...p.toJSON ? p.toJSON() : p,
            _type: "payment"
          }))
        ].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        let runningBalance = balanceAtStart;
        const result = timeline.map((entry) => {
          if (entry._type === "purchase") {
            runningBalance += entry.amount;
          } else {
            runningBalance -= entry.amount;
          }
          return { ...entry, balanceAfter: runningBalance };
        });
        return result.reverse();
      }
    )
  );
}
exports.registerSupplierHandlers = registerSupplierHandlers;
