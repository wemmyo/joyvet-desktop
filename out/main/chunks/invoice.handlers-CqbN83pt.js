"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const database = require("./database-Dx0B-evc.js");
const invoice = require("./invoice-Civ-gfB_.js");
const customer = require("./customer-DOw70VuU.js");
const product = require("./product-D77rVCIx.js");
const invoiceItem = require("./invoiceItem-nbCLMwgg.js");
const invoice_service = require("./invoice.service-plxLdCio.js");
require("fs");
require("path");
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
  electron.ipcMain.handle("invoice:getAll", async () => {
    const invoices = await invoice_service.getInvoices({
      order: [["createdAt", "DESC"]],
      include: [{ model: customer.default }, { model: product.default }]
    });
    return invoices.map((i) => i.toJSON());
  });
  electron.ipcMain.handle("invoice:getSingle", async (_event, id) => {
    const invoice2 = await invoice_service.getInvoiceById(id, {
      include: [{ model: customer.default }, { model: product.default }]
    });
    return invoice2.toJSON();
  });
  electron.ipcMain.handle(
    "invoice:filter",
    async (_event, startDate, endDate, saleType) => {
      const schema = zod.z.object({
        startDate: zod.z.string(),
        endDate: zod.z.string(),
        saleType: zod.z.string()
      });
      schema.parse({ startDate, endDate, saleType });
      const MAX_DATE_RANGE = 90;
      if (startDate && endDate) {
        const dateDifference = dayjs(endDate).diff(dayjs(startDate), "days");
        if (dateDifference > MAX_DATE_RANGE) {
          throw new Error(
            `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
          );
        }
      }
      let whereClause = {};
      if (startDate && endDate) {
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
      const invoices = await invoice_service.getInvoices({
        where: Object.keys(whereClause).length ? whereClause : void 0,
        order: [["createdAt", "DESC"]],
        include: [{ model: customer.default }]
      });
      return invoices.map((i) => i.toJSON());
    }
  );
  electron.ipcMain.handle("invoice:filterById", async (_event, id) => {
    const invoices = await invoice_service.getInvoices({
      where: { id: { [sequelize.Op.startsWith]: id } },
      order: [["createdAt", "DESC"]],
      include: [{ model: customer.default }]
    });
    return invoices.map((i) => i.toJSON());
  });
  electron.ipcMain.handle(
    "invoice:create",
    async (_event, invoiceItems, invoice2) => {
      createInvoiceValidation(invoiceItems, invoice2);
      return database.database.transaction(async (t) => {
        const customer$1 = await customer.default.findByPk(invoice2?.customerId, {
          transaction: t
        });
        const customerInvoice = await customer$1.createInvoice(
          {
            saleType: invoice2?.saleType,
            amount: invoice2?.amount,
            profit: invoice2?.profit,
            postedBy: invoice2?.postedBy
          },
          { transaction: t }
        );
        const productInvoiceItems = [];
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
            await product.default.decrement("stock", {
              by: item.quantity,
              where: { id: item.product?.id },
              transaction: t
            });
            product$1.invoiceItem = {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              profit: item.profit
            };
            productInvoiceItems.push(product$1);
          })
        );
        await customerInvoice.addProducts(productInvoiceItems, {
          transaction: t
        });
        if (invoice2?.saleType === "credit" || invoice2?.saleType === "transfer") {
          await customer.default.increment("balance", {
            by: invoice2.amount,
            where: { id: invoice2.customerId },
            transaction: t
          });
        }
        return customerInvoice.toJSON();
      });
    }
  );
  electron.ipcMain.handle("invoice:delete", async (_event, id) => {
    await database.database.transaction(async (t) => {
      const invoice$1 = await invoice.default.findByPk(id, {
        include: [product.default],
        transaction: t
      });
      if (!invoice$1) throw new Error("Invoice not found");
      await Promise.all(
        invoice$1.products.map(async (product$1) => {
          const { invoiceItem: invoiceItem2 } = product$1;
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
  });
  electron.ipcMain.handle(
    "invoice:deleteItem",
    async (_event, { productId, invoiceId, invoiceItemId }) => {
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
    }
  );
  electron.ipcMain.handle(
    "invoice:addItem",
    async (_event, currentInvoice, currentInvoiceItem) => {
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
        if (["credit", "transfer"].includes(currentInvoice.saleType)) {
          await customer.default.increment("balance", {
            by: currentInvoiceItem.amount,
            where: { id: invoice$1.customerId },
            transaction: t
          });
        }
      });
    }
  );
}
exports.registerInvoiceHandlers = registerInvoiceHandlers;
