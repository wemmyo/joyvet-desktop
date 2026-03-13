"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const moment = require("moment");
const zod = require("zod");
const purchase = require("./purchase-BlBXNXRZ.js");
const supplier = require("./supplier-CIPjGeuJ.js");
const product = require("./product-D77rVCIx.js");
const database = require("./database-Dx0B-evc.js");
require("fs");
require("path");
const getPurchases = (args) => {
  return purchase.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getPurchaseById = (id, args) => {
  return purchase.default.findByPk(id, {
    ...args
  }).then((data) => {
    return data;
  });
};
function registerPurchaseHandlers() {
  electron.ipcMain.handle("purchase:getAll", async () => {
    const purchases = await getPurchases({
      include: [{ model: supplier.default }],
      order: [["createdAt", "DESC"]]
    });
    return purchases.map((p) => p.toJSON ? p.toJSON() : p);
  });
  electron.ipcMain.handle("purchase:getById", async (_event, id) => {
    const purchase2 = await getPurchaseById(id, {
      include: [{ model: supplier.default }, { model: product.default }]
    });
    return purchase2.toJSON ? purchase2.toJSON() : purchase2;
  });
  electron.ipcMain.handle(
    "purchase:create",
    async (_event, purchaseItems, meta) => {
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
            amount: meta.amount
          },
          { transaction: t }
        );
        await Promise.all(
          purchaseItems.map(async (each) => {
            const prod = await product.default.findByPk(each.id, { transaction: t });
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
    }
  );
  electron.ipcMain.handle("purchase:delete", async (_event, id) => {
    await database.database.transaction(async (t) => {
      const purchase$1 = await purchase.default.findByPk(id, {
        include: [{ model: product.default }],
        transaction: t
      });
      if (!purchase$1) throw new Error("Purchase not found");
      await Promise.all(
        purchase$1.products.map(async (each) => {
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
        })
      );
      await supplier.default.decrement("balance", {
        by: purchase$1.amount,
        where: { id: purchase$1.supplierId },
        transaction: t
      });
      await purchase$1.destroy({ transaction: t });
    });
  });
  electron.ipcMain.handle(
    "purchase:filter",
    async (_event, startDate, endDate, supplierId) => {
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.createdAt = {
          [sequelize.Op.between]: [
            `${moment(startDate).format("YYYY-MM-DD")} 00:00:00`,
            `${moment(endDate).format("YYYY-MM-DD")} 23:59:59`
          ]
        };
      }
      if (supplierId) {
        whereClause.supplierId = supplierId;
      }
      const purchases = await getPurchases({
        where: Object.keys(whereClause).length ? whereClause : void 0,
        include: [{ model: supplier.default }],
        order: [["createdAt", "DESC"]]
      });
      return purchases.map((p) => p.toJSON ? p.toJSON() : p);
    }
  );
}
exports.registerPurchaseHandlers = registerPurchaseHandlers;
