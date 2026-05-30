import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import { z } from 'zod';
import Product from '../../models/product';
import ProductAuditLog from '../../models/productAuditLog';
import Purchase from '../../models/purchase';
import PurchaseItem from '../../models/purchaseItem';
import Supplier from '../../models/supplier';
import { getPurchaseById } from '../../services/purchase.service';
import database from '../database';
import { withAppReady } from '../runtime';
import {
  purchaseListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';

const MAX_DATE_RANGE = 365;

export function registerPurchaseHandlers(): void {
  ipcMain.handle(
    'purchase:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = purchaseListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await Purchase.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        include: [{ model: Supplier }],
        order: [['createdAt', 'DESC']],
      });
      return toPaginatedResult(
        rows.map((purchase: any) =>
          purchase.toJSON ? purchase.toJSON() : purchase
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'purchase:getById',
    withAppReady(async (_event, id: number) => {
      const purchase = await getPurchaseById(id, {
        include: [{ model: Supplier }, { model: Product }],
      });
      return (purchase as any).toJSON ? (purchase as any).toJSON() : purchase;
    })
  );

  ipcMain.handle(
    'purchase:create',
    withAppReady(async (_event, purchaseItems: any[], meta: any) => {
      const schema = z.object({
        values: z.array(z.any()),
        meta: z.object({
          supplierId: z.number(),
          invoiceNumber: z.string().min(1),
          amount: z.number(),
        }),
      });
      schema.parse({ values: purchaseItems, meta });

      return await database.transaction(async (t: any) => {
        const supplier = await Supplier.findByPk(meta.supplierId, {
          transaction: t,
        });
        if (!supplier) throw new Error('Supplier not found');
        const prodArr: any[] = [];

        const purchase = await (supplier as any).createPurchase(
          {
            invoiceNumber: meta.invoiceNumber,
            amount: meta.amount,
            postedBy: meta.postedBy,
          },
          { transaction: t }
        );

        await Promise.all(
          purchaseItems.map(async (each: any) => {
            const prod = await Product.findByPk(each.id, { transaction: t });

            const stockBefore = (prod as any).stock;
            const stockAfter = stockBefore + each.quantity;

            await Product.increment('stock', {
              by: each.quantity,
              where: { id: each.id },
              transaction: t,
            });

            const priceChanges: any[] = [];
            if (each.unitPrice !== (prod as any).buyPrice) {
              priceChanges.push({
                field: 'buyPrice',
                before: (prod as any).buyPrice,
                after: each.unitPrice,
              });
            }
            if (each.newSellPrice !== (prod as any).sellPrice) {
              priceChanges.push({
                field: 'sellPrice',
                before: (prod as any).sellPrice,
                after: each.newSellPrice,
              });
            }

            await Product.update(
              {
                buyPrice: each.unitPrice,
                sellPrice: each.newSellPrice,
                sellPrice2: each.newSellPrice2,
                sellPrice3: each.newSellPrice3,
              },
              { where: { id: each.id }, transaction: t }
            );

            await ProductAuditLog.create(
              {
                productId: each.id,
                changeType: 'stock_change',
                delta: each.quantity,
                stockBefore,
                stockAfter,
                priceChanges:
                  priceChanges.length > 0 ? JSON.stringify(priceChanges) : null,
                reason: 'purchase_create',
                referenceId: (purchase as any).id,
                referenceType: 'purchase',
                postedBy: meta.postedBy ?? 'unknown',
              },
              { transaction: t }
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
    })
  );

  ipcMain.handle(
    'purchase:update',
    withAppReady(
      async (_event, id: number, purchaseItems: any[], meta: any) => {
        const schema = z.object({
          values: z.array(z.any()),
          meta: z.object({
            invoiceNumber: z.string().min(1),
            amount: z.number(),
            postedBy: z.string(),
          }),
        });
        schema.parse({ values: purchaseItems, meta });

        await database.transaction(async (t: any) => {
          const purchase = await Purchase.findByPk(id, {
            include: [{ model: Product }],
            transaction: t,
          });

          if (!purchase) throw new Error('Purchase not found');

          // Stock guard: ensure reversing original purchase won't go negative
          for (const each of (purchase as any).products) {
            const currentStock = each.stock;
            const oldQty = each.purchaseItem.quantity;
            if (currentStock - oldQty < 0) {
              throw new Error(
                `Cannot edit purchase. Product "${each.title}" has insufficient stock to reverse (stock: ${currentStock}, original qty: ${oldQty})`
              );
            }
          }

          // Reversal: restore old prices + decrement stock
          for (const each of (purchase as any).products) {
            const oldQty = each.purchaseItem.quantity;
            const stockBefore = each.stock;
            const stockAfter = stockBefore - oldQty;

            await Product.update(
              {
                // Fall back to current price if old price was never stored.
                buyPrice: each.purchaseItem.oldBuyPrice ?? each.buyPrice,
                sellPrice: each.purchaseItem.oldSellPrice ?? each.sellPrice,
                sellPrice2: each.purchaseItem.oldSellPrice2 ?? each.sellPrice2,
                sellPrice3: each.purchaseItem.oldSellPrice3 ?? each.sellPrice3,
              },
              { where: { id: each.id }, transaction: t }
            );

            await Product.decrement('stock', {
              by: oldQty,
              where: { id: each.id },
              transaction: t,
            });

            await ProductAuditLog.create(
              {
                productId: each.id,
                changeType: 'stock_change',
                delta: -oldQty,
                stockBefore,
                stockAfter,
                reason: 'purchase_update',
                referenceId: id,
                referenceType: 'purchase',
                postedBy: meta.postedBy,
              },
              { transaction: t }
            );
          }

          // Decrease supplier balance by old amount
          await Supplier.decrement('balance', {
            by: (purchase as any).amount,
            where: { id: (purchase as any).supplierId },
            transaction: t,
          });

          // Destroy old PurchaseItems
          await PurchaseItem.destroy({
            where: { purchaseId: id },
            transaction: t,
          });

          // Re-apply new items
          const newProdArr: any[] = [];
          for (const each of purchaseItems) {
            const prod = await Product.findByPk(each.id, { transaction: t });
            if (!prod) throw new Error(`Product ${each.id} not found`);

            const stockBefore = (prod as any).stock;
            const stockAfter = stockBefore + each.quantity;

            const priceChanges: any[] = [];
            if (each.unitPrice !== (prod as any).buyPrice) {
              priceChanges.push({
                field: 'buyPrice',
                before: (prod as any).buyPrice,
                after: each.unitPrice,
              });
            }
            if (
              each.newSellPrice !== undefined &&
              each.newSellPrice !== (prod as any).sellPrice
            ) {
              priceChanges.push({
                field: 'sellPrice',
                before: (prod as any).sellPrice,
                after: each.newSellPrice,
              });
            }

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

            await ProductAuditLog.create(
              {
                productId: each.id,
                changeType: 'stock_change',
                delta: each.quantity,
                stockBefore,
                stockAfter,
                priceChanges:
                  priceChanges.length > 0 ? JSON.stringify(priceChanges) : null,
                reason: 'purchase_update',
                referenceId: id,
                referenceType: 'purchase',
                postedBy: meta.postedBy,
              },
              { transaction: t }
            );

            (prod as any).purchaseItem = {
              quantity: each.quantity,
              unitPrice: each.unitPrice,
              amount: each.amount,
              sellPrice: each.newSellPrice,
              sellPrice2: each.newSellPrice2,
              sellPrice3: each.newSellPrice3,
              oldBuyPrice: (prod as any).buyPrice,
              oldSellPrice: (prod as any).sellPrice,
              oldSellPrice2: (prod as any).sellPrice2,
              oldSellPrice3: (prod as any).sellPrice3,
              oldStockLevel: stockBefore,
            };
            newProdArr.push(prod);
          }

          await (purchase as any).addProducts(newProdArr, { transaction: t });

          await (purchase as any).update(
            { invoiceNumber: meta.invoiceNumber, amount: meta.amount },
            { transaction: t }
          );

          await Supplier.increment('balance', {
            by: meta.amount,
            where: { id: (purchase as any).supplierId },
            transaction: t,
          });
        });
      }
    )
  );

  ipcMain.handle(
    'purchase:delete',
    withAppReady(async (_event, id: number) => {
      await database.transaction(async (t: any) => {
        const purchase = await Purchase.findByPk(id, {
          include: [{ model: Product }],
          transaction: t,
        });

        if (!purchase) throw new Error('Purchase not found');

        await Promise.all(
          (purchase as any).products.map(async (each: any) => {
            const stockBefore = each.stock;
            const stockAfter = stockBefore - each.purchaseItem.quantity;

            // Guard: ensure reverting this purchase won't push stock negative.
            // (Items from this purchase may have already been sold.)
            if (stockAfter < 0) {
              throw new Error(
                `Cannot delete purchase. Product "${each.title}" only has ${stockBefore} in stock but the purchase recorded ${each.purchaseItem.quantity}. Some items may have already been sold.`
              );
            }

            await Product.update(
              {
                // Fall back to current price if old price was never stored,
                // so we never write null/undefined into a price column.
                buyPrice: each.purchaseItem.oldBuyPrice ?? each.buyPrice,
                sellPrice: each.purchaseItem.oldSellPrice ?? each.sellPrice,
                sellPrice2: each.purchaseItem.oldSellPrice2 ?? each.sellPrice2,
                sellPrice3: each.purchaseItem.oldSellPrice3 ?? each.sellPrice3,
              },
              { where: { id: each.id }, transaction: t }
            );

            await Product.decrement('stock', {
              by: each.purchaseItem.quantity,
              where: { id: each.id },
              transaction: t,
            });

            await ProductAuditLog.create(
              {
                productId: each.id,
                changeType: 'stock_change',
                delta: -each.purchaseItem.quantity,
                stockBefore,
                stockAfter,
                reason: 'purchase_delete',
                referenceId: id,
                referenceType: 'purchase',
                postedBy: (purchase as any).postedBy ?? 'unknown',
              },
              { transaction: t }
            );
          })
        );

        await Supplier.decrement('balance', {
          by: (purchase as any).amount,
          where: { id: (purchase as any).supplierId },
          transaction: t,
        });

        await (purchase as any).destroy({ transaction: t });
      });
    })
  );

  ipcMain.handle(
    'purchase:filter',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = purchaseListQuerySchema.parse(input);
      const { endDate, page, pageSize, startDate, supplierId } = query;
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

      if (supplierId) {
        whereClause.supplierId = supplierId;
      }

      const { rows, count } = await Purchase.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length ? whereClause : undefined,
        include: [{ model: Supplier }],
        order: [['createdAt', 'DESC']],
      });

      return toPaginatedResult(
        rows.map((purchase: any) =>
          purchase.toJSON ? purchase.toJSON() : purchase
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'purchase:search',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = purchaseListQuerySchema.parse(input);
      const { page, pageSize, search } = query;

      if (!search) {
        return toPaginatedResult([], 0, page, pageSize);
      }

      const { rows, count } = await Purchase.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: {
          invoiceNumber: {
            [Op.substring]: search,
          },
        },
        include: [{ model: Supplier }],
        order: [['createdAt', 'DESC']],
      });

      return toPaginatedResult(
        rows.map((purchase: any) =>
          purchase.toJSON ? purchase.toJSON() : purchase
        ),
        count,
        page,
        pageSize
      );
    })
  );
}
