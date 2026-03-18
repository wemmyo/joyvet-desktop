"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const customer = require("./customer-CS2lwHZV.js");
const invoice = require("./invoice-Civ-gfB_.js");
const receipt = require("./receipt-CgVNnpBY.js");
const product = require("./product-D77rVCIx.js");
const receipt_service = require("./receipt.service-DcZJQlU4.js");
const invoice_service = require("./invoice.service-plxLdCio.js");
const listing = require("./listing-fG59YslC.js");
const index = require("../index.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
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
  electron.ipcMain.handle(
    "customer:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.searchPaginationSchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await customer.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        order: [["fullName", "ASC"]]
      });
      return listing.toPaginatedResult(
        rows.map((customer2) => customer2.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "customer:getById",
    index.withAppReady(async (_event, id) => {
      const customer2 = await getCustomerById(id);
      return customer2.toJSON ? customer2.toJSON() : customer2;
    })
  );
  electron.ipcMain.handle(
    "customer:create",
    index.withAppReady(async (_event, values) => {
      const schema = zod.z.object({
        values: zod.z.object({
          fullName: zod.z.string().min(1),
          phoneNumber: zod.z.string().optional(),
          address: zod.z.string().optional()
        })
      });
      schema.parse({ values });
      const customer2 = await createCustomer({ ...values });
      return customer2.toJSON ? customer2.toJSON() : customer2;
    })
  );
  electron.ipcMain.handle(
    "customer:update",
    index.withAppReady(async (_event, id, values) => {
      await updateCustomer(id, values);
    })
  );
  electron.ipcMain.handle(
    "customer:delete",
    index.withAppReady(async (_event, id) => {
      await deleteCustomer(id);
    })
  );
  electron.ipcMain.handle(
    "customer:search",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.searchPaginationSchema.parse(input);
      const { page, pageSize, search } = query;
      if (!search) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const { rows, count } = await customer.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        where: { fullName: { [sequelize.Op.substring]: search } },
        order: [["fullName", "ASC"]]
      });
      return listing.toPaginatedResult(
        rows.map((customer2) => customer2.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "customer:getInvoices",
    index.withAppReady(async (_event, customerId, startDate, endDate) => {
      const invoices = await invoice_service.getInvoices({
        where: {
          customerId,
          createdAt: {
            [sequelize.Op.between]: [
              `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${dayjs(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        },
        order: [["createdAt", "DESC"]]
      });
      return invoices.map((i) => i.toJSON ? i.toJSON() : i);
    })
  );
  electron.ipcMain.handle(
    "customer:getReceipts",
    index.withAppReady(
      async (_event, customerId, startDate, endDate) => {
        const receipts = await receipt_service.getReceipts({
          where: {
            customerId,
            createdAt: {
              [sequelize.Op.between]: [
                `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
                `${dayjs(endDate).format("YYYY-MM-DD")} 23:00:00`
              ]
            }
          },
          order: [["createdAt", "DESC"]]
        });
        return receipts.map((r) => r.toJSON ? r.toJSON() : r);
      }
    )
  );
  electron.ipcMain.handle(
    "customer:getActivityTimeline",
    index.withAppReady(
      async (_event, customerId, startDate, endDate) => {
        const startStr = `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`;
        const endStr = `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`;
        const invoiceSumBefore = await invoice.default.sum("amount", {
          where: {
            customerId,
            saleType: { [sequelize.Op.in]: ["credit", "transfer"] },
            createdAt: {
              [sequelize.Op.lt]: startStr
            }
          }
        }) || 0;
        const receiptSumBefore = await receipt.default.sum("amount", {
          where: {
            customerId,
            createdAt: { [sequelize.Op.lt]: startStr }
          }
        }) || 0;
        const balanceAtStart = invoiceSumBefore - receiptSumBefore;
        const dateRange = { [sequelize.Op.between]: [startStr, endStr] };
        const [invoices, receipts] = await Promise.all([
          invoice.default.findAll({
            where: { customerId, createdAt: dateRange },
            include: [{ model: product.default }],
            order: [["createdAt", "ASC"]]
          }),
          receipt.default.findAll({
            where: { customerId, createdAt: dateRange },
            order: [["createdAt", "ASC"]]
          })
        ]);
        const timeline = [
          ...invoices.map((i) => ({
            ...i.toJSON ? i.toJSON() : i,
            _type: "invoice"
          })),
          ...receipts.map((r) => ({
            ...r.toJSON ? r.toJSON() : r,
            _type: "receipt"
          }))
        ].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        let runningBalance = balanceAtStart;
        const result = timeline.map((entry) => {
          if (entry._type === "invoice") {
            if (["credit", "transfer"].includes(entry.saleType)) {
              runningBalance += entry.amount;
            }
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
exports.registerCustomerHandlers = registerCustomerHandlers;
