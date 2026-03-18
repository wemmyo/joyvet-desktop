"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const database = require("./database-Dx0B-evc.js");
const invoice = require("./invoice-Civ-gfB_.js");
const customer = require("./customer-CS2lwHZV.js");
const product = require("./product-D77rVCIx.js");
const invoiceItem = require("./invoiceItem-nbCLMwgg.js");
const productAuditLog = require("./productAuditLog-DrnoXAKA.js");
const invoice_service = require("./invoice.service-plxLdCio.js");
const listing = require("./listing-fG59YslC.js");
const index = require("../index.js");
require("fs");
require("path");
require("zod");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const sum = (prev, next) => {
  return prev + next;
};
const createInvoiceValidation = (values, meta) => {
  if (values.length === 0) {
    throw new Error("Products validation failed");
  }
  const sumOfOrders = (orders) => {
    if (orders.length === 0) {
      return 0;
    }
    return orders.map((item) => {
      return item.amount;
    }).reduce(sum);
  };
  if (sumOfOrders(values) !== meta.amount) {
    throw new Error("Amount doesn't add up in validation");
  }
  values.forEach((each) => {
    if (!each.quantity) {
      throw new Error("Each quantity validation failed");
    } else if (!each.amount) {
      throw new Error("Each amount validation failed");
    } else if (each.quantity * each.unitPrice !== each.amount) {
      throw new Error("Product of quantity and unit price doesn't add up");
    }
  });
};
function registerInvoiceHandlers() {
  electron.ipcMain.handle(
    "invoice:getAll",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.invoiceListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await invoice.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        order: [["createdAt", "DESC"]],
        include: [{ model: customer.default }]
      });
      return listing.toPaginatedResult(
        rows.map((invoice2) => invoice2.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "invoice:getSingle",
    index.withAppReady(async (_event, id) => {
      const invoice2 = await invoice_service.getInvoiceById(id, {
        include: [{ model: customer.default }, { model: product.default }]
      });
      if (!invoice2) throw new Error("Invoice not found");
      return invoice2.toJSON();
    })
  );
  electron.ipcMain.handle(
    "invoice:filter",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.invoiceListQuerySchema.parse(input);
      const { endDate, page, pageSize, saleType, search, startDate } = query;
      const whereClause = {};
      const MAX_DATE_RANGE = 90;
      if (startDate && endDate) {
        const dateDifference = dayjs(endDate).diff(dayjs(startDate), "days");
        if (dateDifference > MAX_DATE_RANGE) {
          throw new Error(
            `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
          );
        }
        whereClause.createdAt = {
          [sequelize.Op.between]: [
            `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`,
            `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`
          ]
        };
      }
      if (saleType !== "all") {
        whereClause.saleType = saleType;
      }
      if (search) {
        const invoiceId = Number(search);
        if (Number.isNaN(invoiceId)) {
          return listing.toPaginatedResult([], 0, page, pageSize);
        }
        whereClause.id = invoiceId;
      }
      const { rows, count } = await invoice.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length > 0 ? whereClause : void 0,
        order: [["createdAt", "DESC"]],
        include: [{ model: customer.default }]
      });
      return listing.toPaginatedResult(
        rows.map((invoice2) => invoice2.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "invoice:filterById",
    index.withAppReady(async (_event, input = {}) => {
      const query = listing.invoiceListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      const invoiceId = Number(search);
      if (!search || Number.isNaN(invoiceId)) {
        return listing.toPaginatedResult([], 0, page, pageSize);
      }
      const { rows, count } = await invoice.default.findAndCountAll({
        distinct: true,
        ...listing.toPaginationOptions({ page, pageSize }),
        where: { id: invoiceId },
        order: [["createdAt", "DESC"]],
        include: [{ model: customer.default }]
      });
      return listing.toPaginatedResult(
        rows.map((invoice2) => invoice2.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );
  electron.ipcMain.handle(
    "invoice:create",
    index.withAppReady(async (_event, invoiceItems, invoice2, postedBy) => {
      createInvoiceValidation(invoiceItems, invoice2);
      return await database.database.transaction(async (t) => {
        const customer$1 = await customer.default.findByPk(invoice2?.customerId, {
          transaction: t
        });
        const customerInvoice = await customer$1.createInvoice(
          {
            saleType: invoice2?.saleType,
            amount: invoice2?.amount,
            profit: invoice2?.profit,
            postedBy: invoice2?.postedBy ?? postedBy
          },
          { transaction: t }
        );
        await Promise.all(
          invoiceItems.map(async (item) => {
            const product$1 = await product.default.findByPk(item.product?.id, {
              transaction: t
            });
            if (!item.quantity) {
              throw new Error(`Quantity missing for ${product$1.title}`);
            }
            if (item.quantity > product$1.stock) {
              throw new Error(
                `Not enough in stock for ${product$1.title}. ${product$1.stock} remaining`
              );
            }
            const stockBefore = product$1.stock;
            const stockAfter = stockBefore - item.quantity;
            await product.default.decrement("stock", {
              by: item.quantity,
              where: { id: item.product?.id },
              transaction: t
            });
            await productAuditLog.default.create(
              {
                productId: product$1.id,
                changeType: "stock_change",
                delta: -item.quantity,
                stockBefore,
                stockAfter,
                reason: "invoice_create",
                referenceId: customerInvoice.id,
                referenceType: "invoice",
                postedBy: invoice2?.postedBy ?? postedBy ?? "unknown"
              },
              { transaction: t }
            );
            await invoiceItem.default.create(
              {
                invoiceId: customerInvoice.id,
                productId: product$1.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                profit: item.profit
              },
              { transaction: t }
            );
          })
        );
        if (invoice2?.saleType === "credit" || invoice2?.saleType === "transfer") {
          await customer.default.increment("balance", {
            by: invoice2.amount,
            where: { id: invoice2.customerId },
            transaction: t
          });
        }
        return customerInvoice.toJSON();
      });
    })
  );
  electron.ipcMain.handle(
    "invoice:delete",
    index.withAppReady(async (_event, id) => {
      await database.database.transaction(async (t) => {
        const invoice$1 = await invoice.default.findByPk(id, {
          include: [product.default],
          transaction: t
        });
        if (!invoice$1) throw new Error("Invoice not found");
        await Promise.all(
          invoice$1.products.map(async (product$1) => {
            const { invoiceItem: invoiceItem2 } = product$1;
            if (!invoiceItem2) {
              return;
            }
            if (typeof invoiceItem2.quantity !== "number" || isNaN(invoiceItem2.quantity)) {
              throw new Error(
                `Invalid invoice item quantity for product: ${product$1.title}. Cannot safely restore stock.`
              );
            }
            const newStock = product$1.stock + invoiceItem2.quantity;
            if (newStock < 0) {
              throw new Error(
                `Can't delete invoice. Negative stock for: ${product$1.title}`
              );
            }
            await product.default.update(
              { stock: newStock },
              { where: { id: product$1.id }, transaction: t }
            );
            await productAuditLog.default.create(
              {
                productId: product$1.id,
                changeType: "stock_change",
                delta: invoiceItem2.quantity,
                stockBefore: product$1.stock,
                stockAfter: newStock,
                reason: "invoice_delete",
                referenceId: id,
                referenceType: "invoice",
                postedBy: invoice$1.postedBy ?? "unknown"
              },
              { transaction: t }
            );
          })
        );
        if (["credit", "transfer"].includes(invoice$1.saleType)) {
          await customer.default.decrement("balance", {
            by: invoice$1.amount,
            where: { id: invoice$1.customerId },
            transaction: t
          });
        }
        await invoice$1.destroy({ transaction: t });
      });
    })
  );
  electron.ipcMain.handle(
    "invoice:deleteItem",
    index.withAppReady(async (_event, { productId, invoiceId, invoiceItemId }) => {
      await database.database.transaction(async (t) => {
        const invoice$1 = await invoice.default.findByPk(invoiceId, { transaction: t });
        if (!invoice$1) throw new Error("Invoice not found");
        const invoiceItem$1 = await invoiceItem.default.findByPk(invoiceItemId, {
          transaction: t
        });
        if (!invoiceItem$1) throw new Error("Invoice item not found");
        const product$1 = await product.default.findByPk(productId, { transaction: t });
        if (!product$1) throw new Error("Product not found");
        const newStock = product$1.stock + invoiceItem$1.quantity;
        if (newStock < 0) {
          throw new Error(
            `Deleting this item would result in negative stock for: ${product$1.title}`
          );
        }
        await product.default.update(
          { stock: newStock },
          { where: { id: productId }, transaction: t }
        );
        await productAuditLog.default.create(
          {
            productId,
            changeType: "stock_change",
            delta: invoiceItem$1.quantity,
            stockBefore: product$1.stock,
            stockAfter: newStock,
            reason: "invoice_delete_item",
            referenceId: invoiceId,
            referenceType: "invoice",
            postedBy: invoice$1.postedBy ?? "unknown"
          },
          { transaction: t }
        );
        const updatedAmount = invoice$1.amount - invoiceItem$1.amount;
        const updatedProfit = invoice$1.profit - invoiceItem$1.profit;
        await invoice$1.update(
          { amount: updatedAmount, profit: updatedProfit },
          { transaction: t }
        );
        if (["credit", "transfer"].includes(invoice$1.saleType)) {
          await customer.default.decrement("balance", {
            by: invoiceItem$1.amount,
            where: { id: invoice$1.customerId },
            transaction: t
          });
        }
        await invoiceItem$1.destroy({ transaction: t });
      });
    })
  );
  electron.ipcMain.handle(
    "invoice:addItem",
    index.withAppReady(async (_event, currentInvoice, currentInvoiceItem) => {
      await database.database.transaction(async (t) => {
        const invoice$1 = await invoice.default.findByPk(currentInvoice.id, {
          transaction: t
        });
        if (!invoice$1) throw new Error("Invoice not found");
        const product$1 = await product.default.findByPk(currentInvoiceItem.product?.id, {
          transaction: t
        });
        if (!product$1) throw new Error("Product not found");
        const existingItem = await invoiceItem.default.findOne({
          where: {
            invoiceId: invoice$1.id,
            productId: product$1.id
          },
          transaction: t
        });
        if (existingItem) {
          const updatedQuantity = existingItem.quantity + currentInvoiceItem.quantity;
          const updatedAmount = updatedQuantity * existingItem.unitPrice;
          const updatedProfit = updatedQuantity * (existingItem.unitPrice - product$1.buyPrice);
          await existingItem.update(
            {
              quantity: updatedQuantity,
              amount: updatedAmount,
              profit: updatedProfit
            },
            { transaction: t }
          );
        } else {
          await invoiceItem.default.create(
            {
              invoiceId: invoice$1.id,
              productId: product$1.id,
              quantity: currentInvoiceItem.quantity,
              unitPrice: currentInvoiceItem.unitPrice,
              amount: currentInvoiceItem.amount,
              profit: currentInvoiceItem.profit
            },
            { transaction: t }
          );
        }
        const updatedItems = await invoiceItem.default.findAll({
          where: { invoiceId: invoice$1.id },
          transaction: t
        });
        const totalAmount = updatedItems.reduce(
          (acc, item) => acc + item.amount,
          0
        );
        const totalProfit = updatedItems.reduce(
          (acc, item) => acc + item.profit,
          0
        );
        await invoice$1.update(
          { amount: totalAmount, profit: totalProfit },
          { transaction: t }
        );
        const newStock = product$1.stock - currentInvoiceItem.quantity;
        if (newStock < 0) {
          throw new Error(
            `Not enough stock for: ${product$1.title}. Only ${product$1.stock} left.`
          );
        }
        await product$1.update({ stock: newStock }, { transaction: t });
        await productAuditLog.default.create(
          {
            productId: product$1.id,
            changeType: "stock_change",
            delta: -currentInvoiceItem.quantity,
            stockBefore: product$1.stock,
            stockAfter: newStock,
            reason: "invoice_add_item",
            referenceId: invoice$1.id,
            referenceType: "invoice",
            postedBy: currentInvoice.postedBy ?? "unknown"
          },
          { transaction: t }
        );
        if (["credit", "transfer"].includes(currentInvoice.saleType)) {
          await customer.default.increment("balance", {
            by: currentInvoiceItem.amount,
            where: { id: invoice$1.customerId },
            transaction: t
          });
        }
      });
    })
  );
  electron.ipcMain.handle(
    "invoice:updateItem",
    index.withAppReady(
      async (_event, {
        invoiceItemId,
        invoiceId,
        productId,
        newQuantity,
        postedBy
      }) => {
        await database.database.transaction(async (t) => {
          const invoice$1 = await invoice.default.findByPk(invoiceId, { transaction: t });
          if (!invoice$1) throw new Error("Invoice not found");
          const invoiceItem$1 = await invoiceItem.default.findByPk(invoiceItemId, {
            transaction: t
          });
          if (!invoiceItem$1) throw new Error("Invoice item not found");
          const product$1 = await product.default.findByPk(productId, { transaction: t });
          if (!product$1) throw new Error("Product not found");
          const oldQuantity = invoiceItem$1.quantity;
          const delta = newQuantity - oldQuantity;
          if (delta > 0 && product$1.stock < delta) {
            throw new Error(
              `Not enough stock for: ${product$1.title}. Only ${product$1.stock} available.`
            );
          }
          const stockBefore = product$1.stock;
          const stockAfter = stockBefore - delta;
          await product.default.update(
            { stock: stockAfter },
            { where: { id: productId }, transaction: t }
          );
          const unitPrice = invoiceItem$1.unitPrice;
          const newAmount = newQuantity * unitPrice;
          const newProfit = (unitPrice - product$1.buyPrice) * newQuantity;
          await invoiceItem$1.update(
            { quantity: newQuantity, amount: newAmount, profit: newProfit },
            { transaction: t }
          );
          const allItems = await invoiceItem.default.findAll({
            where: { invoiceId },
            transaction: t
          });
          const totalAmount = allItems.reduce(
            (acc, item) => acc + item.amount,
            0
          );
          const totalProfit = allItems.reduce(
            (acc, item) => acc + item.profit,
            0
          );
          await invoice$1.update(
            { amount: totalAmount, profit: totalProfit },
            { transaction: t }
          );
          if (["credit", "transfer"].includes(invoice$1.saleType)) {
            const balanceDelta = newAmount - invoiceItem$1.amount;
            if (balanceDelta > 0) {
              await customer.default.increment("balance", {
                by: balanceDelta,
                where: { id: invoice$1.customerId },
                transaction: t
              });
            } else if (balanceDelta < 0) {
              await customer.default.decrement("balance", {
                by: Math.abs(balanceDelta),
                where: { id: invoice$1.customerId },
                transaction: t
              });
            }
          }
          await productAuditLog.default.create(
            {
              productId,
              changeType: "stock_change",
              delta: -delta,
              stockBefore,
              stockAfter,
              reason: "invoice_update_item",
              referenceId: invoiceId,
              referenceType: "invoice",
              postedBy: postedBy ?? "unknown"
            },
            { transaction: t }
          );
        });
      }
    )
  );
}
exports.registerInvoiceHandlers = registerInvoiceHandlers;
