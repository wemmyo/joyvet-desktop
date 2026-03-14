import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import Payment from '../../models/payment';
import Purchase from '../../models/purchase';
import {
  createSupplier,
  getSupplierById,
  getSuppliers,
  deleteSupplier,
  updateSupplier,
} from '../../services/supplier.service';

export function registerSupplierHandlers(): void {
  ipcMain.handle('supplier:getAll', async () => {
    const suppliers = await getSuppliers({ order: [['fullName', 'ASC']] });
    return suppliers.map((s: any) => (s.toJSON ? s.toJSON() : s));
  });

  ipcMain.handle('supplier:getById', async (_event, id: number) => {
    const supplier = await getSupplierById(id);
    return (supplier as any).toJSON ? (supplier as any).toJSON() : supplier;
  });

  ipcMain.handle('supplier:create', async (_event, values: any) => {
    const schema = z.object({
      fullName: z.string().min(1),
      phoneNumber: z.string(),
      address: z.string(),
    });
    schema.parse(values);
    const supplier = await createSupplier({ ...values, id: Date.now() });
    return (supplier as any).toJSON ? (supplier as any).toJSON() : supplier;
  });

  ipcMain.handle('supplier:update', async (_event, id: number, values: any) => {
    const schema = z.object({
      id: z.number(),
      fullName: z.string().min(1),
      phoneNumber: z.string(),
      address: z.string(),
    });
    schema.parse({ ...values, id });
    await updateSupplier(id, values);
  });

  ipcMain.handle('supplier:delete', async (_event, id: number) => {
    await deleteSupplier(id);
  });

  ipcMain.handle('supplier:search', async (_event, value: string) => {
    const schema = z.object({ value: z.string().min(1) });
    schema.parse({ value });
    const suppliers = await getSuppliers({
      where: { fullName: { [Op.substring]: value } },
    });
    return suppliers.map((s: any) => (s.toJSON ? s.toJSON() : s));
  });

  ipcMain.handle(
    'payment:getBySupplier',
    async (_event, supplierId: number, startDate: string, endDate: string) => {
      const schema = z.object({
        supplierId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      });
      schema.parse({ supplierId, startDate, endDate });

      const payments = await Payment.findAll({
        where: {
          supplierId,
          createdAt: {
            [Op.between]: [
              `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${dayjs(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
      });
      return payments.map((p: any) => (p.toJSON ? p.toJSON() : p));
    }
  );

  ipcMain.handle(
    'purchase:getBySupplier',
    async (_event, supplierId: number, startDate: string, endDate: string) => {
      const schema = z.object({
        supplierId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      });
      schema.parse({ supplierId, startDate, endDate });

      const purchases = await Purchase.findAll({
        where: {
          supplierId,
          createdAt: {
            [Op.between]: [
              `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${dayjs(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
      });
      return purchases.map((p: any) => (p.toJSON ? p.toJSON() : p));
    }
  );
}
