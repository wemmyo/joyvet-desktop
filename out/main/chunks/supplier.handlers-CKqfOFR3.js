"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const payment = require("./payment-9-9dtC0H.js");
const purchase = require("./purchase-BlBXNXRZ.js");
const supplier = require("./supplier-CIPjGeuJ.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
const getSuppliers = (args) => {
  return supplier.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
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
  electron.ipcMain.handle("supplier:getAll", async () => {
    const suppliers = await getSuppliers({ order: [["fullName", "ASC"]] });
    return suppliers.map((s) => s.toJSON ? s.toJSON() : s);
  });
  electron.ipcMain.handle("supplier:getById", async (_event, id) => {
    const supplier2 = await getSupplierById(id);
    return supplier2.toJSON ? supplier2.toJSON() : supplier2;
  });
  electron.ipcMain.handle("supplier:create", async (_event, values) => {
    const schema = zod.z.object({
      fullName: zod.z.string().min(1),
      phoneNumber: zod.z.string(),
      address: zod.z.string()
    });
    schema.parse(values);
    const supplier2 = await createSupplier({ ...values, id: Date.now() });
    return supplier2.toJSON ? supplier2.toJSON() : supplier2;
  });
  electron.ipcMain.handle("supplier:update", async (_event, id, values) => {
    const schema = zod.z.object({
      id: zod.z.number(),
      fullName: zod.z.string().min(1),
      phoneNumber: zod.z.string(),
      address: zod.z.string()
    });
    schema.parse({ ...values, id });
    await updateSupplier(id, values);
  });
  electron.ipcMain.handle("supplier:delete", async (_event, id) => {
    await deleteSupplier(id);
  });
  electron.ipcMain.handle("supplier:search", async (_event, value) => {
    const schema = zod.z.object({ value: zod.z.string().min(1) });
    schema.parse({ value });
    const suppliers = await getSuppliers({
      where: { fullName: { [sequelize.Op.substring]: value } }
    });
    return suppliers.map((s) => s.toJSON ? s.toJSON() : s);
  });
  electron.ipcMain.handle(
    "payment:getBySupplier",
    async (_event, supplierId, startDate, endDate) => {
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
    }
  );
  electron.ipcMain.handle(
    "purchase:getBySupplier",
    async (_event, supplierId, startDate, endDate) => {
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
    }
  );
}
exports.registerSupplierHandlers = registerSupplierHandlers;
