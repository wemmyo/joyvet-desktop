import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import Receipt from '../../models/receipt';
import Customer from '../../models/customer';
import database from '../database';
import { getReceipts } from '../../services/receipt.service';

export function registerReceiptHandlers(): void {
  ipcMain.handle('receipt:getAll', async () => {
    const receipts = await Receipt.findAll({
      include: [{ model: Customer }],
    });
    return receipts.map((r: any) => (r.toJSON ? r.toJSON() : r));
  });

  ipcMain.handle('receipt:create', async (_event, values: any) => {
    const schema = z.object({
      amount: z.number().min(1),
      customerId: z.number(),
      paymentMethod: z.string().min(1),
    });
    schema.parse(values);

    await database.transaction(async (t: any) => {
      const receipt = await Receipt.create(
        {
          customerId: values.customerId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null,
        },
        { transaction: t }
      );

      await Customer.decrement('balance', {
        by: values.amount,
        where: { id: values.customerId },
        transaction: t,
      });

      return (receipt as any).toJSON ? (receipt as any).toJSON() : receipt;
    });
  });

  ipcMain.handle('receipt:delete', async (_event, id: number) => {
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
  });

  ipcMain.handle(
    'receipt:filter',
    async (_event, startDate: string, endDate: string, customerId?: number) => {
      const whereClause: any = {};

      if (startDate && endDate) {
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

      const receipts = await getReceipts({
        where: Object.keys(whereClause).length ? whereClause : undefined,
        include: [{ model: Customer }],
        order: [['createdAt', 'DESC']],
      });
      return receipts.map((r: any) => (r.toJSON ? r.toJSON() : r));
    }
  );
}
