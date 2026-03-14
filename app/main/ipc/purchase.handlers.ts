import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import Purchase from '../../models/purchase';
import Supplier from '../../models/supplier';
import Product from '../../models/product';
import database from '../database';
import { getPurchases, getPurchaseById } from '../../services/purchase.service';

export function registerPurchaseHandlers(): void {
  ipcMain.handle('purchase:getAll', async () => {
    const purchases = await getPurchases({
      include: [{ model: Supplier }],
      order: [['createdAt', 'DESC']],
    });
    return purchases.map((p: any) => (p.toJSON ? p.toJSON() : p));
  });

  ipcMain.handle('purchase:getById', async (_event, id: number) => {
    const purchase = await getPurchaseById(id, {
      include: [{ model: Supplier }, { model: Product }],
    });
    return (purchase as any).toJSON ? (purchase as any).toJSON() : purchase;
  });

  ipcMain.handle(
    'purchase:create',
    async (_event, purchaseItems: any[], meta: any) => {
      const schema = z.object({
        values: z.array(z.any()),
        meta: z.object({
          supplierId: z.number(),
          invoiceNumber: z.string().min(1),
          amount: z.number(),
        }),
      });
      schema.parse({ values: purchaseItems, meta });

      await database.transaction(async (t: any) => {
        const supplier = await Supplier.findByPk(meta.supplierId, {
          transaction: t,
        });
        const prodArr: any[] = [];

        const purchase = await (supplier as any).createPurchase(
          {
            invoiceNumber: meta.invoiceNumber,
            amount: meta.amount,
          },
          { transaction: t }
        );

        await Promise.all(
          purchaseItems.map(async (each: any) => {
            const prod = await Product.findByPk(each.id, { transaction: t });

            await Product.increment('stock', {
              by: each.quantity,
              where: { id: each.id },
              transaction: t,
            });

            await Product.update(
              {
                buyPrice: each.unitPrice,
                sellPrice: each.newSellPrice,
                sellPrice2: each.newSellPrice2,
                sellPrice3: each.newSellPrice3,
              },
              { where: { id: each.id }, transaction: t }
            );

            (prod as any).purchaseItem = {
              quantity: each.quantity,
              unitPrice: each.unitPrice,
              amount: each.amount,
              sellPrice: each.newSellPrice,
              sellPrice2: each.newSellPrice2,
              sellPrice3: each.newSellPrice3,
              oldBuyPrice: each.buyPrice,
              oldSellPrice: each.sellPrice,
              oldSellPrice2: each.sellPrice2,
              oldSellPrice3: each.sellPrice3,
              oldStockLevel: each.stock,
            };
            prodArr.push(prod);
          })
        );

        await purchase.addProducts(prodArr, { transaction: t });

        await Supplier.increment('balance', {
          by: meta.amount,
          where: { id: meta.supplierId },
          transaction: t,
        });

        return purchase.toJSON();
      });
    }
  );

  ipcMain.handle('purchase:delete', async (_event, id: number) => {
    await database.transaction(async (t: any) => {
      const purchase = await Purchase.findByPk(id, {
        include: [{ model: Product }],
        transaction: t,
      });

      if (!purchase) throw new Error('Purchase not found');

      await Promise.all(
        (purchase as any).products.map(async (each: any) => {
          await Product.update(
            {
              buyPrice: each.purchaseItem.oldBuyPrice,
              sellPrice: each.purchaseItem.oldSellPrice,
              sellPrice2: each.purchaseItem.oldSellPrice2,
              sellPrice3: each.purchaseItem.oldSellPrice3,
            },
            { where: { id: each.id }, transaction: t }
          );

          await Product.decrement('stock', {
            by: each.purchaseItem.quantity,
            where: { id: each.id },
            transaction: t,
          });
        })
      );

      await Supplier.decrement('balance', {
        by: (purchase as any).amount,
        where: { id: (purchase as any).supplierId },
        transaction: t,
      });

      await (purchase as any).destroy({ transaction: t });
    });
  });

  ipcMain.handle(
    'purchase:filter',
    async (_event, startDate: string, endDate: string, supplierId?: number) => {
      const whereClause: any = {};

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

      const purchases = await getPurchases({
        where: Object.keys(whereClause).length ? whereClause : undefined,
        include: [{ model: Supplier }],
        order: [['createdAt', 'DESC']],
      });
      return purchases.map((p: any) => (p.toJSON ? p.toJSON() : p));
    }
  );
}
