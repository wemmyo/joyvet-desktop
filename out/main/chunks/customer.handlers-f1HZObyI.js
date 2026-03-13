"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const moment = require("moment");
const zod = require("zod");
const customer = require("./customer-DOw70VuU.js");
const receipt_service = require("./receipt.service-DSTjl21x.js");
const invoice_service = require("./invoice.service-plxLdCio.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("./receipt-CgVNnpBY.js");
require("./invoice-Civ-gfB_.js");
const getCustomers = (args) => {
  return customer.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getCustomerById = (id) => {
  return customer.default.findByPk(id, {}).then((data) => {
    return data;
  });
};
const updateCustomer = (id, customer$1) => {
  return customer.default.update(customer$1, {
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const deleteCustomer = (id) => {
  return customer.default.destroy({
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const createCustomer = (customer$1) => {
  return customer.default.create(customer$1).then((data) => {
    return data;
  });
};
function registerCustomerHandlers() {
  electron.ipcMain.handle("customer:getAll", async () => {
    const customers = await getCustomers({ order: [["fullName", "ASC"]] });
    return customers.map((c) => c.toJSON ? c.toJSON() : c);
  });
  electron.ipcMain.handle("customer:getById", async (_event, id) => {
    const customer2 = await getCustomerById(id);
    return customer2.toJSON ? customer2.toJSON() : customer2;
  });
  electron.ipcMain.handle("customer:create", async (_event, values) => {
    const schema = zod.z.object({
      values: zod.z.object({
        fullName: zod.z.string().min(1),
        phoneNumber: zod.z.string().optional(),
        address: zod.z.string().optional()
      })
    });
    schema.parse({ values });
    const customer2 = await createCustomer({ ...values, id: Date.now() });
    return customer2.toJSON ? customer2.toJSON() : customer2;
  });
  electron.ipcMain.handle("customer:update", async (_event, id, values) => {
    await updateCustomer(id, values);
  });
  electron.ipcMain.handle("customer:delete", async (_event, id) => {
    await deleteCustomer(id);
  });
  electron.ipcMain.handle("customer:search", async (_event, value) => {
    const schema = zod.z.object({ value: zod.z.string().min(1) });
    schema.parse({ value });
    const customers = await getCustomers({
      where: { fullName: { [sequelize.Op.substring]: value } }
    });
    return customers.map((c) => c.toJSON ? c.toJSON() : c);
  });
  electron.ipcMain.handle(
    "customer:getInvoices",
    async (_event, customerId, startDate, endDate) => {
      const invoices = await invoice_service.getInvoices({
        where: {
          customerId,
          createdAt: {
            [sequelize.Op.between]: [
              `${moment(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${moment(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        },
        order: [["createdAt", "DESC"]]
      });
      return invoices.map((i) => i.toJSON ? i.toJSON() : i);
    }
  );
  electron.ipcMain.handle(
    "customer:getReceipts",
    async (_event, customerId, startDate, endDate) => {
      const receipts = await receipt_service.getReceipts({
        where: {
          customerId,
          createdAt: {
            [sequelize.Op.between]: [
              `${moment(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${moment(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        },
        order: [["createdAt", "DESC"]]
      });
      return receipts.map((r) => r.toJSON ? r.toJSON() : r);
    }
  );
}
exports.registerCustomerHandlers = registerCustomerHandlers;
