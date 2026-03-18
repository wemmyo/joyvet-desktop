"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const purchase = require("./purchase-BlBXNXRZ.js");
const supplier = require("./supplier-D6HH6Jzr.js");
const product = require("./product-D77rVCIx.js");
const purchaseItem = require("./purchaseItem-CTTHQz2J.js");
const productAuditLog = require("./productAuditLog-DrnoXAKA.js");
const database = require("./database-Dx0B-evc.js");
const listing = require("./listing-fG59YslC.js");
const index = require("../index.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const getPurchaseById = (id, args) => {
  return purchase.default.findByPk(id, {
    ...args
  }).then((data) => {
    return data;
  });
};
function registerPurchaseHandlers() {
  electron.ipcMain.handle(
    "purchase:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.purchaseListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await purchase.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        include: [{ model: supplier.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((purchase2) => purchase2.toJSON ? purchase2.toJSON() : purchase2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "purchase:getById",
    index.withAppReady(async (_event, id) => {
      const purchase2 = await getPurchaseById(id, {
        include: [{ model: supplier.default }, { model: product.default }]
      });
      return purchase2.toJSON ? purchase2.toJSON() : purchase2;
    })
  );
  electron.ipcMain.handle(
    "purchase:create",
    index.withAppReady(async (_event, purchaseItems, meta) => {
      const schema = zod.z.object({
        values: zod.z.array(zod.z.any()),
        meta: zod.z.object({
          supplierId: zod.z.number(),
          invoiceNumber: zod.z.string().min(1),
          amount: zod.z.number()
        })
      });
      schema.parse({ values: purchaseItems, meta });
      await database.database.transaction(async (t) => {
        const supplier$1 = await supplier.default.findByPk(meta.supplierId, {
          transaction: t
        });
        const prodArr = [];
        const purchase2 = await supplier$1.createPurchase(
          {
            invoiceNumber: meta.invoiceNumber,
            amount: meta.amount,
            postedBy: meta.postedBy
          },
          { transaction: t }
        );
        await Promise.all(
          purchaseItems.map(async (each) => {
            const prod = await product.default.findByPk(each.id, { transaction: t });
            const stockBefore = prod.stock;
            const stockAfter = stockBefore + each.quantity;
            await product.default.increment("stock", {
              by: each.quantity,
              where: { id: each.id },
              transaction: t
            });
            const priceChanges = [];
            if (each.unitPrice !== prod.buyPrice) {
              priceChanges.push({
                field: "buyPrice",
                before: prod.buyPrice,
                after: each.unitPrice
              });
            }
            if (each.newSellPrice !== prod.sellPrice) {
              priceChanges.push({
                field: "sellPrice",
                before: prod.sellPrice,
                after: each.newSellPrice
              });
            }
            await product.default.update(
              {
                buyPrice: each.unitPrice,
                sellPrice: each.newSellPrice,
                sellPrice2: each.newSellPrice2,
                sellPrice3: each.newSellPrice3
              },
              { where: { id: each.id }, transaction: t }
            );
            await productAuditLog.default.create(
              {
                productId: each.id,
                changeType: "stock_change",
                delta: each.quantity,
                stockBefore,
                stockAfter,
                priceChanges: priceChanges.length > 0 ? JSON.stringify(priceChanges) : null,
                reason: "purchase_create",
                referenceId: purchase2.id,
                referenceType: "purchase",
                postedBy: meta.postedBy ?? "unknown"
              },
              { transaction: t }
            );
            prod.purchaseItem = {
              quantity: each.quantity,
              unitPrice: each.unitPrice,
              amount: each.amount,
              sellPrice: each.newSellPrice,
              sellPrice2: each.newSellPrice2,
              sellPrice3: each.newSellPrice3,
              oldBuyPrice: each.buyPrice,
              oldSellPrice: each.sellPrice,
              oldSellPrice2: each.sellPrice2,
              oldSellPrice3: each.sellPrice3,
              oldStockLevel: each.stock
            };
            prodArr.push(prod);
          })
        );
        await purchase2.addProducts(prodArr, { transaction: t });
        await supplier.default.increment("balance", {
          by: meta.amount,
          where: { id: meta.supplierId },
          transaction: t
        });
        return purchase2.toJSON();
      });
    })
  );
  electron.ipcMain.handle(
    "purchase:update",
    index.withAppReady(async (_event, id, purchaseItems, meta) => {
      const schema = zod.z.object({
        values: zod.z.array(zod.z.any()),
        meta: zod.z.object({
          invoiceNumber: zod.z.string().min(1),
          amount: zod.z.number(),
          postedBy: zod.z.string()
        })
      });
      schema.parse({ values: purchaseItems, meta });
      await database.database.transaction(async (t) => {
        const purchase$1 = await purchase.default.findByPk(id, {
          include: [{ model: product.default }],
          transaction: t
        });
        if (!purchase$1) throw new Error("Purchase not found");
        for (const each of purchase$1.products) {
          const currentStock = each.stock;
          const oldQty = each.purchaseItem.quantity;
          if (currentStock - oldQty < 0) {
            throw new Error(
              `Cannot edit purchase. Product "${each.title}" has insufficient stock to reverse (stock: ${currentStock}, original qty: ${oldQty})`
            );
          }
        }
        for (const each of purchase$1.products) {
          const oldQty = each.purchaseItem.quantity;
          const stockBefore = each.stock;
          const stockAfter = stockBefore - oldQty;
          await product.default.update(
            {
              buyPrice: each.purchaseItem.oldBuyPrice,
              sellPrice: each.purchaseItem.oldSellPrice,
              sellPrice2: each.purchaseItem.oldSellPrice2,
              sellPrice3: each.purchaseItem.oldSellPrice3
            },
            { where: { id: each.id }, transaction: t }
          );
          await product.default.decrement("stock", {
            by: oldQty,
            where: { id: each.id },
            transaction: t
          });
          await productAuditLog.default.create(
            {
              productId: each.id,
              changeType: "stock_change",
              delta: -oldQty,
              stockBefore,
              stockAfter,
              reason: "purchase_update",
              referenceId: id,
              referenceType: "purchase",
              postedBy: meta.postedBy
            },
            { transaction: t }
          );
        }
        await supplier.default.decrement("balance", {
          by: purchase$1.amount,
          where: { id: purchase$1.supplierId },
          transaction: t
        });
        await purchaseItem.default.destroy({
          where: { purchaseId: id },
          transaction: t
        });
        const newProdArr = [];
        for (const each of purchaseItems) {
          const prod = await product.default.findByPk(each.id, { transaction: t });
          if (!prod) throw new Error(`Product ${each.id} not found`);
          const stockBefore = prod.stock;
          const stockAfter = stockBefore + each.quantity;
          const priceChanges = [];
          if (each.unitPrice !== prod.buyPrice) {
            priceChanges.push({
              field: "buyPrice",
              before: prod.buyPrice,
              after: each.unitPrice
            });
          }
          if (each.newSellPrice !== void 0 && each.newSellPrice !== prod.sellPrice) {
            priceChanges.push({
              field: "sellPrice",
              before: prod.sellPrice,
              after: each.newSellPrice
            });
          }
          await product.default.increment("stock", {
            by: each.quantity,
            where: { id: each.id },
            transaction: t
          });
          await product.default.update(
            {
              buyPrice: each.unitPrice,
              sellPrice: each.newSellPrice,
              sellPrice2: each.newSellPrice2,
              sellPrice3: each.newSellPrice3
            },
            { where: { id: each.id }, transaction: t }
          );
          await productAuditLog.default.create(
            {
              productId: each.id,
              changeType: "stock_change",
              delta: each.quantity,
              stockBefore,
              stockAfter,
              priceChanges: priceChanges.length > 0 ? JSON.stringify(priceChanges) : null,
              reason: "purchase_update",
              referenceId: id,
              referenceType: "purchase",
              postedBy: meta.postedBy
            },
            { transaction: t }
          );
          prod.purchaseItem = {
            quantity: each.quantity,
            unitPrice: each.unitPrice,
            amount: each.amount,
            sellPrice: each.newSellPrice,
            sellPrice2: each.newSellPrice2,
            sellPrice3: each.newSellPrice3,
            oldBuyPrice: prod.buyPrice,
            oldSellPrice: prod.sellPrice,
            oldSellPrice2: prod.sellPrice2,
            oldSellPrice3: prod.sellPrice3,
            oldStockLevel: stockBefore
          };
          newProdArr.push(prod);
        }
        await purchase$1.addProducts(newProdArr, { transaction: t });
        await purchase$1.update(
          { invoiceNumber: meta.invoiceNumber, amount: meta.amount },
          { transaction: t }
        );
        await supplier.default.increment("balance", {
          by: meta.amount,
          where: { id: purchase$1.supplierId },
          transaction: t
        });
      });
    })
  );
  electron.ipcMain.handle(
    "purchase:delete",
    index.withAppReady(async (_event, id) => {
      await database.database.transaction(async (t) => {
        const purchase$1 = await purchase.default.findByPk(id, {
          include: [{ model: product.default }],
          transaction: t
        });
        if (!purchase$1) throw new Error("Purchase not found");
        await Promise.all(
          purchase$1.products.map(async (each) => {
            const stockBefore = each.stock;
            const stockAfter = stockBefore - each.purchaseItem.quantity;
            await product.default.update(
              {
                buyPrice: each.purchaseItem.oldBuyPrice,
                sellPrice: each.purchaseItem.oldSellPrice,
                sellPrice2: each.purchaseItem.oldSellPrice2,
                sellPrice3: each.purchaseItem.oldSellPrice3
              },
              { where: { id: each.id }, transaction: t }
            );
            await product.default.decrement("stock", {
              by: each.purchaseItem.quantity,
              where: { id: each.id },
              transaction: t
            });
            await productAuditLog.default.create(
              {
                productId: each.id,
                changeType: "stock_change",
                delta: -each.purchaseItem.quantity,
                stockBefore,
                stockAfter,
                reason: "purchase_delete",
                referenceId: id,
                referenceType: "purchase",
                postedBy: purchase$1.postedBy ?? "unknown"
              },
              { transaction: t }
            );
          })
        );
        await supplier.default.decrement("balance", {
          by: purchase$1.amount,
          where: { id: purchase$1.supplierId },
          transaction: t
        });
        await purchase$1.destroy({ transaction: t });
      });
    })
  );
  electron.ipcMain.handle(
    "purchase:filter",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.purchaseListQuerySchema.parse(input);
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
      const { rows, count } = await purchase.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length ? whereClause : void 0,
        include: [{ model: supplier.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((purchase2) => purchase2.toJSON ? purchase2.toJSON() : purchase2),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "purchase:search",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.purchaseListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      if (!search) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const { rows, count } = await purchase.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: {
          invoiceNumber: {
            [sequelize.Op.substring]: search
          }
        },
        include: [{ model: supplier.default }],
        order: [["createdAt", "DESC"]]
      });
      return listing.toPaginatedResult(
        rows.map((purchase2) => purchase2.toJSON ? purchase2.toJSON() : purchase2),
        count,
        page,
        pageSize
      );
    })
  );
}
exports.registerPurchaseHandlers = registerPurchaseHandlers;
