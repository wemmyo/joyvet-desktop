"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const product = require("./product-D77rVCIx.js");
const purchaseItem = require("./purchaseItem-CTTHQz2J.js");
const invoiceItem = require("./invoiceItem-nbCLMwgg.js");
require("./database-Dx0B-evc.js");
require("fs");
require("path");
const getProducts = (args) => {
  return product.default.findAll({
    ...args
  }).then((data) => {
    return data.map((item) => {
      return item;
    });
  });
};
const getProductById = (id) => {
  return product.default.findByPk(id, {}).then((data) => {
    return data;
  });
};
const updateProduct = (id, product$1) => {
  return product.default.update(product$1, {
    where: {
      id
    }
  }).then((data) => {
    return data;
  });
};
const deleteProduct = (id) => {
  return product.default.destroy({
    where: {
      id
    }
  }).then((data) => {
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
  electron.ipcMain.handle("product:getAll", async (_event, filter) => {
    const filters = {};
    if (filter === "inStock") {
      filters.where = { stock: { [sequelize.Op.gt]: 0 } };
    }
    const products = await getProducts({
      ...filters,
      order: [["title", "ASC"]]
    });
    return products.map((p) => p.toJSON ? p.toJSON() : p);
  });
  electron.ipcMain.handle("product:getById", async (_event, id) => {
    const product2 = await getProductById(id);
    return product2.toJSON ? product2.toJSON() : product2;
  });
  electron.ipcMain.handle("product:create", async (_event, values) => {
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
  });
  electron.ipcMain.handle("product:update", async (_event, id, values) => {
    await updateProduct(id, values);
  });
  electron.ipcMain.handle("product:delete", async (_event, id) => {
    await deleteProduct(id);
  });
  electron.ipcMain.handle("product:search", async (_event, value) => {
    const schema = zod.z.object({ value: zod.z.string().min(1) });
    schema.parse({ value });
    const products = await getProducts({
      where: { title: { [sequelize.Op.substring]: value } }
    });
    return products.map((p) => p.toJSON ? p.toJSON() : p);
  });
  electron.ipcMain.handle(
    "product:getInvoices",
    async (_event, productId, startDate, endDate) => {
      const items = await getInvoiceItems({
        where: {
          productId,
          createdAt: {
            [sequelize.Op.between]: [
              `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${dayjs(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        },
        order: [["createdAt", "DESC"]]
      });
      return items.map((i) => i.toJSON ? i.toJSON() : i);
    }
  );
  electron.ipcMain.handle(
    "product:getPurchases",
    async (_event, productId, startDate, endDate) => {
      const items = await getPurchaseItems({
        where: {
          productId,
          createdAt: {
            [sequelize.Op.between]: [
              `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
              `${dayjs(endDate).format("YYYY-MM-DD")} 23:00:00`
            ]
          }
        },
        order: [["createdAt", "DESC"]]
      });
      return items.map((i) => i.toJSON ? i.toJSON() : i);
    }
  );
}
exports.registerProductHandlers = registerProductHandlers;
