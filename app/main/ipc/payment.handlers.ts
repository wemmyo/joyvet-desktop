import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import Payment from '../../models/payment';
import Supplier from '../../models/supplier';
import database from '../database';
import { getPaymentById, updatePayment } from '../../services/payment.service';
import {
  paymentListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';
import { withAppReady } from '../runtime';

const paymentInputSchema = z.object({
  amount: z.number().min(1),
  supplierId: z.number(),
  paymentMethod: z.string().min(1).optional(),
  bank: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export function registerPaymentHandlers(): void {
  ipcMain.handle(
    'payment:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = paymentListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await Payment.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        include: [{ model: Supplier }],
        order: [['createdAt', 'DESC']],
      });
      return toPaginatedResult(
        rows.map((payment: any) => (payment.toJSON ? payment.toJSON() : payment)),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'payment:getById',
    withAppReady(async (_event, id: number) => {
      z.number().parse(id);

      const payment = await getPaymentById(id, {
        include: [{ model: Supplier }],
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return (payment as any).toJSON ? (payment as any).toJSON() : payment;
    })
  );

  ipcMain.handle(
    'payment:create',
    withAppReady(async (_event, values: any) => {
      const parsedValues = paymentInputSchema.parse(values);

      await database.transaction(async (t: any) => {
        const payment = await Payment.create(
          {
            supplierId: parsedValues.supplierId,
            amount: parsedValues.amount,
            paymentMethod: parsedValues.paymentMethod || null,
            bank: parsedValues.bank || null,
            note: parsedValues.note || null,
            postedBy: values.postedBy || null,
          },
          { transaction: t }
        );

        await Supplier.decrement('balance', {
          by: parsedValues.amount,
          where: { id: parsedValues.supplierId },
          transaction: t,
        });

        return (payment as any).toJSON ? (payment as any).toJSON() : payment;
      });
    })
  );

  ipcMain.handle(
    'payment:update',
    withAppReady(async (_event, id: number, values: any) => {
      z.number().parse(id);
      const parsedValues = paymentInputSchema.parse(values);

      await database.transaction(async (t: any) => {
        const payment = await Payment.findByPk(id, { transaction: t });

        if (!payment) {
          throw new Error('Payment not found');
        }

        await Supplier.increment('balance', {
          by: (payment as any).amount,
          where: { id: (payment as any).supplierId },
          transaction: t,
        });

        await Supplier.decrement('balance', {
          by: parsedValues.amount,
          where: { id: parsedValues.supplierId },
          transaction: t,
        });

        await updatePayment(
          id,
          {
            ...parsedValues,
            paymentMethod:
              parsedValues.paymentMethod || (payment as any).paymentMethod,
            bank: parsedValues.bank || (payment as any).bank || undefined,
            note: parsedValues.note || undefined,
          },
          t
        );
      });
    })
  );

  ipcMain.handle(
    'payment:delete',
    withAppReady(async (_event, id: number) => {
      const schema = z.object({ id: z.number() });
      schema.parse({ id });

      await database.transaction(async (t: any) => {
        const payment = await Payment.findByPk(id, { transaction: t });
        if (!payment) throw new Error('Payment not found');

        await Supplier.increment('balance', {
          by: (payment as any).amount,
          where: { id: (payment as any).supplierId },
          transaction: t,
        });

        await (payment as any).destroy({ transaction: t });
      });
    })
  );

  ipcMain.handle(
    'payment:filter',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = paymentListQuerySchema.parse(input);
      const { endDate, page, pageSize, startDate, supplierId } = query;
      const whereClause: Record<string, unknown> = {};

      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [
            `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
          ],
        };
      }

      if (supplierId) {
        whereClause.supplierId = supplierId;
      }

      const { rows, count } = await Payment.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length ? whereClause : undefined,
        include: [{ model: Supplier }],
        order: [['createdAt', 'DESC']],
      });

      return toPaginatedResult(
        rows.map((payment: any) => (payment.toJSON ? payment.toJSON() : payment)),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'payment:search',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = paymentListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      const paymentId = Number(search);

      if (!search || Number.isNaN(paymentId)) {
        return toPaginatedResult([], 0, page, pageSize);
      }

      const { rows, count } = await Payment.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: { id: paymentId },
        include: [{ model: Supplier }],
        order: [['createdAt', 'DESC']],
      });

      return toPaginatedResult(
        rows.map((payment: any) => (payment.toJSON ? payment.toJSON() : payment)),
        count,
        page,
        pageSize
      );
    })
  );
}
