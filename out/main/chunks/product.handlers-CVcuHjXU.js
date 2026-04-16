"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const database = require("./database-Dx0B-evc.js");
const product = require("./product-D77rVCIx.js");
const productAuditLog = require("./productAuditLog-DrnoXAKA.js");
const purchaseItem = require("./purchaseItem-CTTHQz2J.js");
const invoiceItem = require("./invoiceItem-nbCLMwgg.js");
const listing = require("./listing-iK2d8TQt.js");
const index = require("../index.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const getProductById = (id) => {
  return product.default.findByPk(id, {}).then((data) => {
    return data;
  });
};
const createProduct = (product$1) => {
  return product.default.create(product$1).then((data) => {
    return data;
  });
};
const getPurchaseItems = (args) => {
  return purchaseItem.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getInvoiceItems = (args) => {
  return invoiceItem.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
function registerProductHandlers() {
  electron.ipcMain.handle(
    "product:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.productListQuerySchema.parse(input);
      const { filter, page, pageSize } = query;
      const where = filter === "inStock" ? { stock: { [sequelize.Op.gt]: 0 } } : void 0;
      const { rows, count } = await product.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        where,
        order: [["title", "ASC"]]
      });
      return listing.toPaginatedResult(
        rows.map(
          (product2) => product2.toJSON ? product2.toJSON() : product2
        ),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "product:getById",
    index.withAppReady(async (_event, id) => {
      const product2 = await getProductById(id);
      return product2.toJSON ? product2.toJSON() : product2;
    })
  );
  electron.ipcMain.handle(
    "product:create",
    index.withAppReady(async (_event, values) => {
      const schema = zod.z.object({
        values: zod.z.object({
          title: zod.z.string().min(1),
          sellPrice: zod.z.number(),
          sellPrice2: zod.z.number(),
          sellPrice3: zod.z.number(),
          buyPrice: zod.z.number()
        })
      });
      schema.parse({ values });
      await createProduct(values);
    })
  );
  electron.ipcMain.handle(
    "product:update",
    index.withAppReady(async (_event, id, values) => {
      const updateSchema = zod.z.object({
        title: zod.z.string().min(1).max(255).optional(),
        stock: zod.z.number().min(0).optional(),
        buyPrice: zod.z.number().optional(),
        sellPrice: zod.z.number().optional(),
        sellPrice2: zod.z.number().optional(),
        sellPrice3: zod.z.number().optional(),
        reorderLevel: zod.z.number().optional(),
        productCode: zod.z.string().optional().nullable(),
        numberInPack: zod.z.number().optional().nullable(),
        _postedBy: zod.z.string().optional()
      });
      updateSchema.parse(values);
      const { _postedBy, ...productValues } = values;
      const postedBy = _postedBy || "unknown";
      await database.database.transaction(async (t) => {
        const product$1 = await product.default.findByPk(id, { transaction: t });
        if (!product$1) {
          throw new Error("Product not found");
        }
        const stockBefore = product$1.stock;
        const stockChanged = productValues.stock !== void 0 && productValues.stock !== stockBefore;
        const priceFields = [
          "buyPrice",
          "sellPrice",
          "sellPrice2",
          "sellPrice3"
        ];
        const priceChanges = [];
        priceFields.forEach((field) => {
          if (productValues[field] !== void 0 && productValues[field] !== product$1[field]) {
            priceChanges.push({
              field,
              before: product$1[field],
              after: productValues[field]
            });
          }
        });
        await product.default.update(productValues, { where: { id }, transaction: t });
        if (stockChanged) {
          await productAuditLog.default.create(
            {
              productId: id,
              changeType: "stock_change",
              delta: productValues.stock - stockBefore,
              stockBefore,
              stockAfter: productValues.stock,
              reason: "manual_edit",
              referenceType: "manual",
              postedBy
            },
            { transaction: t }
          );
        }
        if (priceChanges.length > 0) {
          await productAuditLog.default.create(
            {
              productId: id,
              changeType: "price_change",
              priceChanges: JSON.stringify(priceChanges),
              reason: "manual_edit",
              referenceType: "manual",
              postedBy
            },
            { transaction: t }
          );
        }
      });
    })
  );
  electron.ipcMain.handle(
    "product:delete",
    index.withAppReady(async (_event, id) => {
      await database.database.transaction(async (t) => {
        const invoiceItemCount = await invoiceItem.default.count({
          where: { productId: id },
          transaction: t
        });
        if (invoiceItemCount > 0) {
          throw new Error(
            `Cannot delete product referenced by existing invoices (${invoiceItemCount} line items). Remove invoices first.`
          );
        }
        const purchaseItemCount = await purchaseItem.default.count({
          where: { productId: id },
          transaction: t
        });
        if (purchaseItemCount > 0) {
          throw new Error(
            `Cannot delete product referenced by existing purchases (${purchaseItemCount} line items). Remove purchases first.`
          );
        }
        await product.default.destroy({ where: { id }, transaction: t });
      });
    })
  );
  electron.ipcMain.handle(
    "product:search",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.productListQuerySchema.parse(input);
      const { filter, page, pageSize, search } = query;
      if (!search) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const where = {
        ...filter === "inStock" ? { stock: { [sequelize.Op.gt]: 0 } } : {},
        title: { [sequelize.Op.substring]: search }
      };
      const { rows, count } = await product.default.findAndCountAll({
        ...listing.toPaginationOptions({ page, pageSize }),
        where,
        order: [["title", "ASC"]]
      });
      return listing.toPaginatedResult(
        rows.map(
          (product2) => product2.toJSON ? product2.toJSON() : product2
        ),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "product:getInvoices",
    index.withAppReady(
      async (_event, productId, startDate, endDate) => {
        const items = await getInvoiceItems({
          where: {
            productId,
            createdAt: {
              [sequelize.Op.between]: [
                `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
                `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`
              ]
            }
          },
          order: [["createdAt", "DESC"]]
        });
        return items.map((i) => i.toJSON ? i.toJSON() : i);
      }
    )
  );
  electron.ipcMain.handle(
    "product:getPurchases",
    index.withAppReady(
      async (_event, productId, startDate, endDate) => {
        const items = await getPurchaseItems({
          where: {
            productId,
            createdAt: {
              [sequelize.Op.between]: [
                `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
                `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`
              ]
            }
          },
          order: [["createdAt", "DESC"]]
        });
        return items.map((i) => i.toJSON ? i.toJSON() : i);
      }
    )
  );
  electron.ipcMain.handle(
    "product:getAuditLog",
    index.withAppReady(
      async (_event, productId, startDate, endDate) => {
        const logs = await productAuditLog.default.findAll({
          where: {
            productId,
            createdAt: {
              [sequelize.Op.between]: [
                `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
                `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`
              ]
            }
          },
          order: [["createdAt", "DESC"]]
        });
        return logs.map((log) => log.toJSON ? log.toJSON() : log);
      }
    )
  );
}
exports.registerProductHandlers = registerProductHandlers;
