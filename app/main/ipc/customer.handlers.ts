import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import { z } from 'zod';
import Customer from '../../models/customer';
import Invoice from '../../models/invoice';
import Product from '../../models/product';
import Receipt from '../../models/receipt';
import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from '../../services/customer.service';
import { getInvoices } from '../../services/invoice.service';
import { getReceipts } from '../../services/receipt.service';
import database from '../database';
import { withAppReady } from '../runtime';
import {
  searchPaginationSchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';

export function registerCustomerHandlers(): void {
  ipcMain.handle(
    'customer:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = searchPaginationSchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await Customer.findAndCountAll({
        ...toPaginationOptions({ page, pageSize }),
        order: [['fullName', 'ASC']],
      });

      return toPaginatedResult(
        rows.map((customer: any) => customer.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'customer:getById',
    withAppReady(async (_event, id: number) => {
      const customer = await getCustomerById(id);
      return (customer as any).toJSON ? (customer as any).toJSON() : customer;
    })
  );

  ipcMain.handle(
    'customer:create',
    withAppReady(async (_event, values: any) => {
      const schema = z.object({
        values: z.object({
          fullName: z.string().min(1),
          phoneNumber: z.string().optional(),
          address: z.string().optional(),
        }),
      });
      schema.parse({ values });
      const customer = await createCustomer({ ...values });
      return (customer as any).toJSON ? (customer as any).toJSON() : customer;
    })
  );

  ipcMain.handle(
    'customer:update',
    withAppReady(async (_event, id: number, values: any) => {
      const updateSchema = z.object({
        fullName: z.string().min(1).max(255).optional(),
        phoneNumber: z.string().max(50).optional().nullable(),
        address: z.string().max(500).optional().nullable(),
        balance: z.number().optional(),
        maxPriceLevel: z.number().min(0).max(3).optional(),
      });
      const parsed = updateSchema.parse(values);
      await updateCustomer(id, parsed);
    })
  );

  ipcMain.handle(
    'customer:delete',
    withAppReady(async (_event, id: number) => {
      await database.transaction(async (t: any) => {
        const invoiceCount = await Invoice.count({
          where: { customerId: id },
          transaction: t,
        });
        if (invoiceCount > 0) {
          throw new Error(
            `Cannot delete customer with existing invoices (${invoiceCount} found). Remove invoices first.`
          );
        }

        const receiptCount = await Receipt.count({
          where: { customerId: id },
          transaction: t,
        });
        if (receiptCount > 0) {
          throw new Error(
            `Cannot delete customer with existing receipts (${receiptCount} found). Remove receipts first.`
          );
        }

        await Customer.destroy({ where: { id }, transaction: t });
      });
    })
  );

  ipcMain.handle(
    'customer:search',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = searchPaginationSchema.parse(input);
      const { page, pageSize, search } = query;

      if (!search) {
        return toPaginatedResult([], 0, page, pageSize);
      }

      const { rows, count } = await Customer.findAndCountAll({
        ...toPaginationOptions({ page, pageSize }),
        where: { fullName: { [Op.substring]: search } },
        order: [['fullName', 'ASC']],
      });

      return toPaginatedResult(
        rows.map((customer: any) => customer.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'customer:getInvoices',
    withAppReady(
      async (
        _event,
        customerId: number,
        startDate: string,
        endDate: string
      ) => {
        const invoices = await getInvoices({
          where: {
            customerId,
            createdAt: {
              [Op.between]: [
                `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
                `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
              ],
            },
          },
          order: [['createdAt', 'DESC']],
        });
        return invoices.map((i: any) => (i.toJSON ? i.toJSON() : i));
      }
    )
  );

  ipcMain.handle(
    'customer:getReceipts',
    withAppReady(
      async (
        _event,
        customerId: number,
        startDate?: string,
        endDate?: string
      ) => {
        const whereClause: any = { customerId };
        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [
              `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
            ],
          };
        }
        const receipts = await getReceipts({
          where: whereClause,
          order: [['createdAt', 'DESC']],
        });
        return receipts.map((r: any) => (r.toJSON ? r.toJSON() : r));
      }
    )
  );

  ipcMain.handle(
    'customer:getActivityTimeline',
    withAppReady(
      async (
        _event,
        customerId: number,
        startDate: string,
        endDate: string
      ) => {
        const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
        const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;

        // Compute balance at start of period
        const invoiceSumBefore =
          (await Invoice.sum('amount', {
            where: {
              customerId,
              saleType: { [Op.in]: ['credit', 'transfer'] },
              createdAt: {
                [Op.lt]: startStr,
              },
            },
          })) || 0;

        const receiptSumBefore =
          (await Receipt.sum('amount', {
            where: {
              customerId,
              createdAt: { [Op.lt]: startStr },
            },
          })) || 0;

        const balanceAtStart = invoiceSumBefore - receiptSumBefore;

        const dateRange = { [Op.between]: [startStr, endStr] };

        const [invoices, receipts] = await Promise.all([
          Invoice.findAll({
            where: { customerId, createdAt: dateRange },
            include: [{ model: Product }],
            order: [['createdAt', 'ASC']],
          }),
          Receipt.findAll({
            where: { customerId, createdAt: dateRange },
            order: [['createdAt', 'ASC']],
          }),
        ]);

        const timeline = [
          ...invoices.map((i: any) => ({
            ...(i.toJSON ? i.toJSON() : i),
            _type: 'invoice',
          })),
          ...receipts.map((r: any) => ({
            ...(r.toJSON ? r.toJSON() : r),
            _type: 'receipt',
          })),
        ].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        let runningBalance = balanceAtStart;
        const result = timeline.map((entry) => {
          if (entry._type === 'invoice') {
            if (['credit', 'transfer'].includes(entry.saleType)) {
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
