"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const sequelize = require("sequelize");
const dayjs = require("dayjs");
const zod = require("zod");
const invoice = require("./invoice-Civ-gfB_.js");
const receipt = require("./receipt-CgVNnpBY.js");
const purchase = require("./purchase-BlBXNXRZ.js");
const payment = require("./payment-9-9dtC0H.js");
const expense = require("./expense-e9NOTXMw.js");
const customer = require("./customer-CS2lwHZV.js");
const supplier = require("./supplier-D6HH6Jzr.js");
const database = require("./database-Dx0B-evc.js");
const index = require("../index.js");
require("fs");
require("path");
require("electron-updater");
require("electron-log");
require("bcryptjs");
const dateRangeSchema = zod.z.object({
  startDate: zod.z.string(),
  endDate: zod.z.string()
});
function registerAnalyticsHandlers() {
  electron.ipcMain.handle(
    "analytics:getSummary",
    index.withAppReady(async (_event, input = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`;
      const endStr = `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`;
      const dateRange = { [sequelize.Op.between]: [startStr, endStr] };
      const [
        invoiceTotal,
        invoiceProfit,
        purchaseTotal,
        receiptTotal,
        paymentTotal,
        expenseTotal,
        customerBalanceSum,
        supplierBalanceSum
      ] = await Promise.all([
        invoice.default.sum("amount", { where: { createdAt: dateRange } }),
        invoice.default.sum("profit", { where: { createdAt: dateRange } }),
        purchase.default.sum("amount", { where: { createdAt: dateRange } }),
        receipt.default.sum("amount", { where: { createdAt: dateRange } }),
        payment.default.sum("amount", { where: { createdAt: dateRange } }),
        expense.default.sum("amount", { where: { createdAt: dateRange } }),
        customer.default.sum("balance"),
        supplier.default.sum("balance")
      ]);
      return {
        invoiceTotal: invoiceTotal || 0,
        invoiceProfit: invoiceProfit || 0,
        purchaseTotal: purchaseTotal || 0,
        receiptTotal: receiptTotal || 0,
        paymentTotal: paymentTotal || 0,
        expenseTotal: expenseTotal || 0,
        customerBalanceSum: customerBalanceSum || 0,
        supplierBalanceSum: supplierBalanceSum || 0
      };
    })
  );
  electron.ipcMain.handle(
    "analytics:getTopCustomers",
    index.withAppReady(async (_event, input = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`;
      const endStr = `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`;
      const results = await database.database.query(
        `SELECT i.customerId, c.fullName, SUM(i.amount) as total
         FROM invoices i
         JOIN customers c ON i.customerId = c.id
         WHERE i.createdAt BETWEEN :startStr AND :endStr
         GROUP BY i.customerId
         ORDER BY total DESC
         LIMIT 10`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { startStr, endStr }
        }
      );
      return results;
    })
  );
  electron.ipcMain.handle(
    "analytics:getBestSellingProducts",
    index.withAppReady(async (_event, input = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`;
      const endStr = `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`;
      const results = await database.database.query(
        `SELECT ii.productId, p.title, p.buyPrice,
                SUM(ii.quantity) as totalQty,
                SUM(ii.amount) as revenue,
                SUM(ii.profit) as profit
         FROM invoiceItems ii
         JOIN products p ON ii.productId = p.id
         JOIN invoices inv ON ii.invoiceId = inv.id
         WHERE inv.createdAt BETWEEN :startStr AND :endStr
         GROUP BY ii.productId
         ORDER BY totalQty DESC
         LIMIT 10`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { startStr, endStr }
        }
      );
      return results.map((row) => ({
        ...row,
        marginPct: row.revenue > 0 ? Math.round(row.profit / row.revenue * 100) : 0
      }));
    })
  );
  electron.ipcMain.handle(
    "analytics:getTopSuppliersBySpend",
    index.withAppReady(async (_event, input = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`;
      const endStr = `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`;
      const results = await database.database.query(
        `SELECT p.supplierId, s.fullName, SUM(p.amount) as total
         FROM purchases p
         JOIN suppliers s ON p.supplierId = s.id
         WHERE p.createdAt BETWEEN :startStr AND :endStr
         GROUP BY p.supplierId
         ORDER BY total DESC
         LIMIT 10`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { startStr, endStr }
        }
      );
      return results;
    })
  );
  electron.ipcMain.handle(
    "analytics:getLowStockProducts",
    index.withAppReady(async (_event, input = {}) => {
      const { page, pageSize, search } = zod.z.object({
        page: zod.z.coerce.number().optional().default(1),
        pageSize: zod.z.coerce.number().optional().default(25),
        search: zod.z.string().optional()
      }).parse(input);
      const offset = (page - 1) * pageSize;
      const searchClause = search ? `AND LOWER(title) LIKE LOWER(:search)` : "";
      const replacements = search ? { search: `%${search}%` } : {};
      const [rows, countRows] = await Promise.all([
        database.database.query(
          `SELECT id, title, stock, reorderLevel, productCode
           FROM products
           WHERE reorderLevel > 0 AND stock <= reorderLevel ${searchClause}
           ORDER BY CAST(stock AS FLOAT) / reorderLevel ASC
           LIMIT ${pageSize} OFFSET ${offset}`,
          { type: sequelize.QueryTypes.SELECT, replacements }
        ),
        database.database.query(
          `SELECT COUNT(*) as total FROM products
           WHERE reorderLevel > 0 AND stock <= reorderLevel ${searchClause}`,
          { type: sequelize.QueryTypes.SELECT, replacements }
        )
      ]);
      return { rows, total: Number(countRows[0]?.total ?? 0), page, pageSize };
    })
  );
  electron.ipcMain.handle(
    "analytics:getRevenueOverTime",
    index.withAppReady(async () => {
      const results = await database.database.query(
        `SELECT strftime('%Y-%m', createdAt) as month,
                SUM(amount) as revenue,
                SUM(profit) as profit
         FROM invoices
         WHERE createdAt >= datetime('now', '-12 months')
         GROUP BY strftime('%Y-%m', createdAt)
         ORDER BY month ASC`,
        { type: sequelize.QueryTypes.SELECT }
      );
      return results;
    })
  );
  electron.ipcMain.handle(
    "analytics:getExpenseBreakdown",
    index.withAppReady(async (_event, input = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format("YYYY-MM-DD")} 00:00:00`;
      const endStr = `${dayjs(endDate).format("YYYY-MM-DD")} 23:59:59`;
      const results = await database.database.query(
        `SELECT COALESCE(type, 'Uncategorized') as type, SUM(amount) as total
         FROM expenses
         WHERE createdAt BETWEEN :startStr AND :endStr
         GROUP BY type
         ORDER BY total DESC`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { startStr, endStr }
        }
      );
      const totalExpenses = results.reduce(
        (acc, row) => acc + (row.total || 0),
        0
      );
      return results.map((row) => ({
        ...row,
        pct: totalExpenses > 0 ? Math.round(row.total / totalExpenses * 100) : 0
      }));
    })
  );
}
exports.registerAnalyticsHandlers = registerAnalyticsHandlers;
