import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import { z } from 'zod';
import Payment from '../../models/payment';
import Product from '../../models/product';
import Purchase from '../../models/purchase';
import Supplier from '../../models/supplier';
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  updateSupplier,
} from '../../services/supplier.service';
import database from '../database';
import { withAppReady } from '../runtime';
import {
  searchPaginationSchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';

export function registerSupplierHandlers(): void {
  ipcMain.handle(
    'supplier:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = searchPaginationSchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await Supplier.findAndCountAll({
        ...toPaginationOptions({ page, pageSize }),
        order: [['fullName', 'ASC']],
      });
      return toPaginatedResult(
        rows.map((supplier: any) =>
          supplier.toJSON ? supplier.toJSON() : supplier
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'supplier:getById',
    withAppReady(async (_event, id: number) => {
      const supplier = await getSupplierById(id);
      return (supplier as any).toJSON ? (supplier as any).toJSON() : supplier;
    })
  );

  ipcMain.handle(
    'supplier:create',
    withAppReady(async (_event, values: any) => {
      const schema = z.object({
        fullName: z.string().min(1),
        phoneNumber: z.string(),
        address: z.string(),
      });
      schema.parse(values);
      const supplier = await createSupplier({ ...values });
      return (supplier as any).toJSON ? (supplier as any).toJSON() : supplier;
    })
  );

  ipcMain.handle(
    'supplier:update',
    withAppReady(async (_event, id: number, values: any) => {
      const schema = z.object({
        id: z.number(),
        fullName: z.string().min(1),
        phoneNumber: z.string(),
        address: z.string(),
      });
      schema.parse({ ...values, id });
      await updateSupplier(id, values);
    })
  );

  ipcMain.handle(
    'supplier:delete',
    withAppReady(async (_event, id: number) => {
      // Wrap the existence checks and delete in a single transaction so no new
      // purchase/payment can be created between the count queries and the delete.
      await database.transaction(async (t: any) => {
        const purchaseCount = await Purchase.count({
          where: { supplierId: id },
          transaction: t,
        });
        if (purchaseCount > 0) {
          throw new Error(
            `Cannot delete supplier with existing purchases (${purchaseCount} found). Remove purchases first.`
          );
        }

        const paymentCount = await Payment.count({
          where: { supplierId: id },
          transaction: t,
        });
        if (paymentCount > 0) {
          throw new Error(
            `Cannot delete supplier with existing payments (${paymentCount} found). Remove payments first.`
          );
        }

        await Supplier.destroy({ where: { id }, transaction: t });
      });
    })
  );

  ipcMain.handle(
    'supplier:search',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = searchPaginationSchema.parse(input);
      const { page, pageSize, search } = query;

      if (!search) {
        return toPaginatedResult([], 0, page, pageSize);
      }

      const { rows, count } = await Supplier.findAndCountAll({
        ...toPaginationOptions({ page, pageSize }),
        where: { fullName: { [Op.substring]: search } },
        order: [['fullName', 'ASC']],
      });
      return toPaginatedResult(
        rows.map((supplier: any) =>
          supplier.toJSON ? supplier.toJSON() : supplier
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'payment:getBySupplier',
    withAppReady(
      async (
        _event,
        supplierId: number,
        startDate: string,
        endDate: string
      ) => {
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
                `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
              ],
            },
          },
          order: [['createdAt', 'DESC']],
        });
        return payments.map((p: any) => (p.toJSON ? p.toJSON() : p));
      }
    )
  );

  ipcMain.handle(
    'purchase:getBySupplier',
    withAppReady(
      async (
        _event,
        supplierId: number,
        startDate: string,
        endDate: string
      ) => {
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
                `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
              ],
            },
          },
          order: [['createdAt', 'DESC']],
        });
        return purchases.map((p: any) => (p.toJSON ? p.toJSON() : p));
      }
    )
  );

  ipcMain.handle(
    'supplier:getActivityTimeline',
    withAppReady(
      async (
        _event,
        supplierId: number,
        startDate: string,
        endDate: string
      ) => {
        const startStr = `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`;
        const endStr = `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`;

        // Compute balance at start of period
        const purchaseSumBefore =
          (await Purchase.sum('amount', {
            where: {
              supplierId,
              createdAt: { [Op.lt]: startStr },
            },
          })) || 0;

        const paymentSumBefore =
          (await Payment.sum('amount', {
            where: {
              supplierId,
              createdAt: { [Op.lt]: startStr },
            },
          })) || 0;

        const balanceAtStart = purchaseSumBefore - paymentSumBefore;

        const dateRange = { [Op.between]: [startStr, endStr] };

        const [purchases, payments] = await Promise.all([
          Purchase.findAll({
            where: { supplierId, createdAt: dateRange },
            include: [{ model: Product }],
            order: [['createdAt', 'ASC']],
          }),
          Payment.findAll({
            where: { supplierId, createdAt: dateRange },
            order: [['createdAt', 'ASC']],
          }),
        ]);

        const timeline = [
          ...purchases.map((p: any) => ({
            ...(p.toJSON ? p.toJSON() : p),
            _type: 'purchase',
          })),
          ...payments.map((p: any) => ({
            ...(p.toJSON ? p.toJSON() : p),
            _type: 'payment',
          })),
        ].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        let runningBalance = balanceAtStart;
        const result = timeline.map((entry) => {
          if (entry._type === 'purchase') {
            runningBalance += entry.amount;
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
