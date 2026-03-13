import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import Payment from '../../models/payment';
import Supplier from '../../models/supplier';
import database from '../database';
import { getPayments } from '../../services/payment.service';

export function registerPaymentHandlers(): void {
  ipcMain.handle('payment:getAll', async () => {
    const payments = await getPayments({});
    return payments.map((p: any) => (p.toJSON ? p.toJSON() : p));
  });

  ipcMain.handle('payment:create', async (_event, values: any) => {
    const schema = z.object({
      values: z.object({
        amount: z.number().min(1),
        supplierId: z.number(),
        paymentMethod: z.string().min(1),
        bank: z.string(),
      }),
    });
    schema.parse({ values });

    await database.transaction(async (t: any) => {
      const payment = await Payment.create(
        {
          supplierId: values.supplierId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null,
        },
        { transaction: t }
      );

      await Supplier.decrement('balance', {
        by: values.amount,
        where: { id: values.supplierId },
        transaction: t,
      });

      return (payment as any).toJSON ? (payment as any).toJSON() : payment;
    });
  });

  ipcMain.handle('payment:delete', async (_event, id: number) => {
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
  });

  ipcMain.handle(
    'payment:filter',
    async (
      _event,
      startDate: string,
      endDate: string,
      supplierId?: number
    ) => {
      const whereClause: any = {};

      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:59:59`,
          ],
        };
      }

      if (supplierId) {
        whereClause.supplierId = supplierId;
      }

      const payments = await getPayments({
        where: Object.keys(whereClause).length ? whereClause : undefined,
        order: [['createdAt', 'DESC']],
      });
      return payments.map((p: any) => (p.toJSON ? p.toJSON() : p));
    }
  );
}
