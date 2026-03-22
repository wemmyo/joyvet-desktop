import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import Customer from '../../models/customer';
import Invoice from '../../models/invoice';
import Receipt from '../../models/receipt';
import Product from '../../models/product';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from '../../services/customer.service';
import { getReceipts } from '../../services/receipt.service';
import { getInvoices } from '../../services/invoice.service';
import {
  searchPaginationSchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';
import { withAppReady } from '../runtime';

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
      await updateCustomer(id, values);
    })
  );

  ipcMain.handle(
    'customer:delete',
    withAppReady(async (_event, id: number) => {
      const invoiceCount = await Invoice.count({ where: { customerId: id } });
      if (invoiceCount > 0) {
        throw new Error(
          `Cannot delete customer with existing invoices (${invoiceCount} found). Remove invoices first.`
        );
      }

      const receiptCount = await Receipt.count({ where: { customerId: id } });
      if (receiptCount > 0) {
        throw new Error(
          `Cannot delete customer with existing receipts (${receiptCount} found). Remove receipts first.`
        );
      }

      await deleteCustomer(id);
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
    withAppReady(async (_event, customerId: number, startDate: string, endDate: string) => {
      const invoices = await getInvoices({
        where: {
          customerId,
          createdAt: {
            [Op.between]: [
              `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${dayjs(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
      });
      return invoices.map((i: any) => (i.toJSON ? i.toJSON() : i));
    })
  );

  ipcMain.handle(
    'customer:getReceipts',
    withAppReady(
      async (_event, customerId: number, startDate?: string, endDate?: string) => {
        const receipts = await getReceipts({
          where: {
            customerId,
            createdAt: {
              [Op.between]: [
                `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
                `${dayjs(endDate).format('YYYY-MM-DD')} 23:00:00`,
              ],
            },
          },
          order: [['createdAt', 'DESC']],
        });
        return receipts.map((r: any) => (r.toJSON ? r.toJSON() : r));
      }
    )
  );

  ipcMain.handle(
    'customer:getActivityTimeline',
    withAppReady(
      async (_event, customerId: number, startDate: string, endDate: string) => {
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
