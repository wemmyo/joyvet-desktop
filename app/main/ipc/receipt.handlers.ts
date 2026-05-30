import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import { z } from 'zod';
import Customer from '../../models/customer';
import Receipt from '../../models/receipt';
import { getReceiptById, updateReceipt } from '../../services/receipt.service';
import database from '../database';
import { withAppReady } from '../runtime';
import {
  receiptListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';

const receiptInputSchema = z.object({
  amount: z.number().min(1),
  customerId: z.number(),
  paymentMethod: z.string().min(1),
  bank: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

const receiptUpdateSchema = z.object({
  amount: z.coerce.number().min(1),
  customerId: z.number(),
  paymentMethod: z.string().min(1).optional(),
  bank: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

const MAX_DATE_RANGE = 365;

export function registerReceiptHandlers(): void {
  ipcMain.handle(
    'receipt:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = receiptListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await Receipt.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        include: [{ model: Customer }],
        order: [['createdAt', 'DESC']],
      });
      return toPaginatedResult(
        rows.map((receipt: any) =>
          receipt.toJSON ? receipt.toJSON() : receipt
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'receipt:getById',
    withAppReady(async (_event, id: number) => {
      z.number().parse(id);

      const receipt = await getReceiptById(id);

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      const hydratedReceipt = await Receipt.findByPk(id, {
        include: [{ model: Customer }],
      });

      return hydratedReceipt && (hydratedReceipt as any).toJSON
        ? (hydratedReceipt as any).toJSON()
        : hydratedReceipt;
    })
  );

  ipcMain.handle(
    'receipt:create',
    withAppReady(async (_event, values: any) => {
      const parsedValues = receiptInputSchema.parse(values);

      return await database.transaction(async (t: any) => {
        const receipt = await Receipt.create(
          {
            customerId: parsedValues.customerId,
            amount: parsedValues.amount,
            paymentMethod: parsedValues.paymentMethod,
            bank: parsedValues.bank || null,
            note: parsedValues.note || null,
            postedBy: values.postedBy || null,
          },
          { transaction: t }
        );

        await Customer.decrement('balance', {
          by: parsedValues.amount,
          where: { id: parsedValues.customerId },
          transaction: t,
        });

        return (receipt as any).toJSON ? (receipt as any).toJSON() : receipt;
      });
    })
  );

  ipcMain.handle(
    'receipt:update',
    withAppReady(async (_event, id: number, values: any) => {
      z.number().parse(id);
      const parsedValues = receiptUpdateSchema.parse(values);

      await database.transaction(async (t: any) => {
        const receipt = await Receipt.findByPk(id, { transaction: t });

        if (!receipt) {
          throw new Error('Receipt not found');
        }

        // Reverse the old receipt's effect on the original customer.
        await Customer.increment('balance', {
          by: (receipt as any).amount,
          where: { id: (receipt as any).customerId },
          transaction: t,
        });

        // Verify the target customer exists before applying the new decrement.
        const targetCustomer = await Customer.findByPk(
          parsedValues.customerId,
          { transaction: t }
        );
        if (!targetCustomer) {
          throw new Error('Customer not found');
        }

        await Customer.decrement('balance', {
          by: parsedValues.amount,
          where: { id: parsedValues.customerId },
          transaction: t,
        });

        await updateReceipt(
          id,
          {
            ...parsedValues,
            paymentMethod:
              parsedValues.paymentMethod || (receipt as any).paymentMethod,
            bank: parsedValues.bank || (receipt as any).bank || undefined,
            note: parsedValues.note || undefined,
          },
          t
        );
      });
    })
  );

  ipcMain.handle(
    'receipt:delete',
    withAppReady(async (_event, id: number) => {
      const schema = z.object({ id: z.number() });
      schema.parse({ id });

      await database.transaction(async (t: any) => {
        const receipt = await Receipt.findByPk(id, { transaction: t });
        if (!receipt) throw new Error('Receipt not found');

        await Customer.increment('balance', {
          by: (receipt as any).amount,
          where: { id: (receipt as any).customerId },
          transaction: t,
        });

        await (receipt as any).destroy({ transaction: t });
      });
    })
  );

  ipcMain.handle(
    'receipt:filter',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = receiptListQuerySchema.parse(input);
      const { customerId, endDate, page, pageSize, startDate } = query;
      const whereClause: Record<string, unknown> = {};

      if (startDate && endDate) {
        const dateDifference = dayjs(endDate).diff(dayjs(startDate), 'days');
        if (dateDifference > MAX_DATE_RANGE) {
          throw new Error(
            `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
          );
        }

        whereClause.createdAt = {
          [Op.between]: [
            `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
          ],
        };
      }

      if (customerId) {
        whereClause.customerId = customerId;
      }

      const { rows, count } = await Receipt.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length ? whereClause : undefined,
        include: [{ model: Customer }],
        order: [['createdAt', 'DESC']],
      });

      return toPaginatedResult(
        rows.map((receipt: any) =>
          receipt.toJSON ? receipt.toJSON() : receipt
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'receipt:search',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = receiptListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      const receiptId = Number(search);

      if (!search || Number.isNaN(receiptId)) {
        return toPaginatedResult([], 0, page, pageSize);
      }

      const { rows, count } = await Receipt.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: { id: receiptId },
        include: [{ model: Customer }],
        order: [['createdAt', 'DESC']],
      });

      return toPaginatedResult(
        rows.map((receipt: any) =>
          receipt.toJSON ? receipt.toJSON() : receipt
        ),
        count,
        page,
        pageSize
      );
    })
  );
}
