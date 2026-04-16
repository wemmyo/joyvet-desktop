import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { Op, QueryTypes } from 'sequelize';
import { z } from 'zod';
import Customer from '../../models/customer';
import Expense from '../../models/expense';
import Invoice from '../../models/invoice';
import Payment from '../../models/payment';
import Purchase from '../../models/purchase';
import Receipt from '../../models/receipt';
import Supplier from '../../models/supplier';
import database from '../database';
import { withAppReady } from '../runtime';

const dateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export function registerAnalyticsHandlers(): void {
  ipcMain.handle(
    'analytics:getSummary',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
      const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;
      const dateRange = { [Op.between]: [startStr, endStr] };

      const [
        invoiceTotal,
        invoiceProfit,
        purchaseTotal,
        receiptTotal,
        paymentTotal,
        expenseTotal,
        customerBalanceSum,
        supplierBalanceSum,
      ] = await Promise.all([
        Invoice.sum('amount', { where: { createdAt: dateRange } }),
        Invoice.sum('profit', { where: { createdAt: dateRange } }),
        Purchase.sum('amount', { where: { createdAt: dateRange } }),
        Receipt.sum('amount', { where: { createdAt: dateRange } }),
        Payment.sum('amount', { where: { createdAt: dateRange } }),
        Expense.sum('amount', { where: { createdAt: dateRange } }),
        Customer.sum('balance'),
        Supplier.sum('balance'),
      ]);

      return {
        invoiceTotal: invoiceTotal || 0,
        invoiceProfit: invoiceProfit || 0,
        purchaseTotal: purchaseTotal || 0,
        receiptTotal: receiptTotal || 0,
        paymentTotal: paymentTotal || 0,
        expenseTotal: expenseTotal || 0,
        customerBalanceSum: customerBalanceSum || 0,
        supplierBalanceSum: supplierBalanceSum || 0,
      };
    })
  );

  ipcMain.handle(
    'analytics:getTopCustomers',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
      const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;

      const results = await database.query(
        `SELECT i.customerId, c.fullName, SUM(i.amount) as total
         FROM invoices i
         JOIN customers c ON i.customerId = c.id
         WHERE i.createdAt BETWEEN :startStr AND :endStr
         GROUP BY i.customerId
         ORDER BY total DESC
         LIMIT 10`,
        {
          type: QueryTypes.SELECT,
          replacements: { startStr, endStr },
        }
      );

      return results;
    })
  );

  ipcMain.handle(
    'analytics:getBestSellingProducts',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
      const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;

      const results = await database.query(
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
          type: QueryTypes.SELECT,
          replacements: { startStr, endStr },
        }
      );

      return (results as any[]).map((row: any) => ({
        ...row,
        marginPct:
          row.revenue > 0 ? Math.round((row.profit / row.revenue) * 100) : 0,
      }));
    })
  );

  ipcMain.handle(
    'analytics:getTopSuppliersBySpend',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
      const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;

      const results = await database.query(
        `SELECT p.supplierId, s.fullName, SUM(p.amount) as total
         FROM purchases p
         JOIN suppliers s ON p.supplierId = s.id
         WHERE p.createdAt BETWEEN :startStr AND :endStr
         GROUP BY p.supplierId
         ORDER BY total DESC
         LIMIT 10`,
        {
          type: QueryTypes.SELECT,
          replacements: { startStr, endStr },
        }
      );

      return results;
    })
  );

  ipcMain.handle(
    'analytics:getLowStockProducts',
    withAppReady(async (_event, input: unknown = {}) => {
      const { page, pageSize, search } = z
        .object({
          page: z.coerce.number().optional().default(1),
          pageSize: z.coerce.number().optional().default(25),
          search: z.string().optional(),
        })
        .parse(input);

      const offset = (page - 1) * pageSize;
      const searchClause = search ? 'AND LOWER(title) LIKE LOWER(:search)' : '';
      const replacements: any = search ? { search: `%${search}%` } : {};

      const [rows, countRows]: any = await Promise.all([
        database.query(
          `SELECT id, title, stock, reorderLevel, productCode
           FROM products
           WHERE reorderLevel > 0 AND stock <= reorderLevel ${searchClause}
           ORDER BY CAST(stock AS FLOAT) / reorderLevel ASC
           LIMIT ${pageSize} OFFSET ${offset}`,
          { type: QueryTypes.SELECT, replacements }
        ),
        database.query(
          `SELECT COUNT(*) as total FROM products
           WHERE reorderLevel > 0 AND stock <= reorderLevel ${searchClause}`,
          { type: QueryTypes.SELECT, replacements }
        ),
      ]);

      return { rows, total: Number(countRows[0]?.total ?? 0), page, pageSize };
    })
  );

  ipcMain.handle(
    'analytics:getRevenueOverTime',
    withAppReady(async () => {
      const results = await database.query(
        `SELECT strftime('%Y-%m', createdAt) as month,
                SUM(amount) as revenue,
                SUM(profit) as profit
         FROM invoices
         WHERE createdAt >= datetime('now', '-12 months')
         GROUP BY strftime('%Y-%m', createdAt)
         ORDER BY month ASC`,
        { type: QueryTypes.SELECT }
      );
      return results;
    })
  );

  ipcMain.handle(
    'analytics:getExpenseBreakdown',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
      const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;

      const results = await database.query(
        `SELECT COALESCE(type, 'Uncategorized') as type, SUM(amount) as total
         FROM expenses
         WHERE createdAt BETWEEN :startStr AND :endStr
         GROUP BY type
         ORDER BY total DESC`,
        {
          type: QueryTypes.SELECT,
          replacements: { startStr, endStr },
        }
      );

      const totalExpenses = (results as any[]).reduce(
        (acc: number, row: any) => acc + (row.total || 0),
        0
      );

      return (results as any[]).map((row: any) => ({
        ...row,
        pct:
          totalExpenses > 0 ? Math.round((row.total / totalExpenses) * 100) : 0,
      }));
    })
  );
}
