import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { DataTypes, Op, QueryTypes } from 'sequelize';
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

const toDayBounds = (startDate: string, endDate: string) => {
  const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
  const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;
  return {
    startStr,
    endStr,
    between: { [Op.between]: [startStr, endStr] },
  };
};

const toAmount = (value: unknown) => Number(value) || 0;

// Model.sum() on INTEGER columns runs parseInt and drops kobo.
const decimalSum = { dataType: DataTypes.FLOAT() };

export function registerAnalyticsHandlers(): void {
  ipcMain.handle(
    'analytics:getSummary',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const { between } = toDayBounds(startDate, endDate);

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
        Invoice.sum('amount', { where: { createdAt: between }, ...decimalSum }),
        Invoice.sum('profit', { where: { createdAt: between }, ...decimalSum }),
        Purchase.sum('amount', { where: { createdAt: between }, ...decimalSum }),
        Receipt.sum('amount', { where: { createdAt: between }, ...decimalSum }),
        Payment.sum('amount', { where: { createdAt: between }, ...decimalSum }),
        // Expenses use the user-entered `date`, not row createdAt.
        Expense.sum('amount', { where: { date: between }, ...decimalSum }),
        Customer.sum('balance', decimalSum),
        Supplier.sum('balance', decimalSum),
      ]);

      return {
        invoiceTotal: toAmount(invoiceTotal),
        invoiceProfit: toAmount(invoiceProfit),
        purchaseTotal: toAmount(purchaseTotal),
        receiptTotal: toAmount(receiptTotal),
        paymentTotal: toAmount(paymentTotal),
        expenseTotal: toAmount(expenseTotal),
        customerBalanceSum: toAmount(customerBalanceSum),
        supplierBalanceSum: toAmount(supplierBalanceSum),
      };
    })
  );

  ipcMain.handle(
    'analytics:getTopCustomers',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const { startStr, endStr } = toDayBounds(startDate, endDate);

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

      return (results as any[]).map((row: any) => ({
        ...row,
        total: toAmount(row.total),
      }));
    })
  );

  ipcMain.handle(
    'analytics:getBestSellingProducts',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const { startStr, endStr } = toDayBounds(startDate, endDate);

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

      return (results as any[]).map((row: any) => {
        const revenue = toAmount(row.revenue);
        const profit = toAmount(row.profit);
        return {
          ...row,
          totalQty: toAmount(row.totalQty),
          revenue,
          profit,
          marginPct: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
        };
      });
    })
  );

  ipcMain.handle(
    'analytics:getTopSuppliersBySpend',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const { startStr, endStr } = toDayBounds(startDate, endDate);

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

      return (results as any[]).map((row: any) => ({
        ...row,
        total: toAmount(row.total),
      }));
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
      return (results as any[]).map((row: any) => ({
        ...row,
        revenue: toAmount(row.revenue),
        profit: toAmount(row.profit),
      }));
    })
  );

  ipcMain.handle(
    'analytics:getExpenseBreakdown',
    withAppReady(async (_event, input: unknown = {}) => {
      const { startDate, endDate } = dateRangeSchema.parse(input);
      const { startStr, endStr } = toDayBounds(startDate, endDate);

      const results = await database.query(
        `SELECT COALESCE(type, 'Uncategorized') as type, SUM(amount) as total
         FROM expenses
         WHERE expenses.date BETWEEN :startStr AND :endStr
         GROUP BY type
         ORDER BY total DESC`,
        {
          type: QueryTypes.SELECT,
          replacements: { startStr, endStr },
        }
      );

      const totalExpenses = (results as any[]).reduce(
        (acc: number, row: any) => acc + toAmount(row.total),
        0
      );

      return (results as any[]).map((row: any) => {
        const total = toAmount(row.total);
        return {
          ...row,
          total,
          pct:
            totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
        };
      });
    })
  );
}
