import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import { z } from 'zod';
import InvoiceItem from '../../models/invoiceItem';
import Product from '../../models/product';
import ProductAuditLog from '../../models/productAuditLog';
import PurchaseItem from '../../models/purchaseItem';
import { getInvoiceItems } from '../../services/invoiceItem.service';
import { createProduct, getProductById } from '../../services/product.service';
import { getPurchaseItems } from '../../services/purchaseItem.service';
import database from '../database';
import { withAppReady } from '../runtime';
import {
  productListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';

export function registerProductHandlers(): void {
  ipcMain.handle(
    'product:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = productListQuerySchema.parse(input);
      const { filter, page, pageSize } = query;
      const where =
        filter === 'inStock' ? { stock: { [Op.gt]: 0 } } : undefined;
      const { rows, count } = await Product.findAndCountAll({
        ...toPaginationOptions({ page, pageSize }),
        where,
        order: [['title', 'ASC']],
      });

      return toPaginatedResult(
        rows.map((product: any) =>
          product.toJSON ? product.toJSON() : product
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'product:getById',
    withAppReady(async (_event, id: number) => {
      const product = await getProductById(id);
      return (product as any).toJSON ? (product as any).toJSON() : product;
    })
  );

  ipcMain.handle(
    'product:create',
    withAppReady(async (_event, values: any) => {
      const schema = z.object({
        values: z.object({
          title: z.string().min(1),
          sellPrice: z.number(),
          sellPrice2: z.number(),
          sellPrice3: z.number(),
          buyPrice: z.number(),
        }),
      });
      schema.parse({ values });
      await createProduct(values);
    })
  );

  ipcMain.handle(
    'product:update',
    withAppReady(async (_event, id: number, values: any) => {
      const updateSchema = z.object({
        title: z.string().min(1).max(255).optional(),
        stock: z.number().min(0).optional(),
        buyPrice: z.number().optional(),
        sellPrice: z.number().optional(),
        sellPrice2: z.number().optional(),
        sellPrice3: z.number().optional(),
        reorderLevel: z.number().optional(),
        productCode: z.string().optional().nullable(),
        numberInPack: z.number().optional().nullable(),
        _postedBy: z.string().optional(),
      });
      updateSchema.parse(values);
      const { _postedBy, ...productValues } = values;
      const postedBy = _postedBy || 'unknown';

      await database.transaction(async (t: any) => {
        const product = await Product.findByPk(id, { transaction: t });
        if (!product) {
          throw new Error('Product not found');
        }

        const stockBefore = (product as any).stock;
        const stockChanged =
          productValues.stock !== undefined &&
          productValues.stock !== stockBefore;

        const priceFields = [
          'buyPrice',
          'sellPrice',
          'sellPrice2',
          'sellPrice3',
        ];
        const priceChanges: any[] = [];
        for (const field of priceFields) {
          if (
            productValues[field] !== undefined &&
            productValues[field] !== (product as any)[field]
          ) {
            priceChanges.push({
              field,
              before: (product as any)[field],
              after: productValues[field],
            });
          }
        }

        await Product.update(productValues, { where: { id }, transaction: t });

        if (stockChanged) {
          await ProductAuditLog.create(
            {
              productId: id,
              changeType: 'stock_change',
              delta: productValues.stock - stockBefore,
              stockBefore,
              stockAfter: productValues.stock,
              reason: 'manual_edit',
              referenceType: 'manual',
              postedBy,
            },
            { transaction: t }
          );
        }

        if (priceChanges.length > 0) {
          await ProductAuditLog.create(
            {
              productId: id,
              changeType: 'price_change',
              priceChanges: JSON.stringify(priceChanges),
              reason: 'manual_edit',
              referenceType: 'manual',
              postedBy,
            },
            { transaction: t }
          );
        }
      });
    })
  );

  ipcMain.handle(
    'product:delete',
    withAppReady(async (_event, id: number) => {
      await database.transaction(async (t: any) => {
        const invoiceItemCount = await InvoiceItem.count({
          where: { productId: id },
          transaction: t,
        });
        if (invoiceItemCount > 0) {
          throw new Error(
            `Cannot delete product referenced by existing invoices (${invoiceItemCount} line items). Remove invoices first.`
          );
        }

        const purchaseItemCount = await PurchaseItem.count({
          where: { productId: id },
          transaction: t,
        });
        if (purchaseItemCount > 0) {
          throw new Error(
            `Cannot delete product referenced by existing purchases (${purchaseItemCount} line items). Remove purchases first.`
          );
        }

        await Product.destroy({ where: { id }, transaction: t });
      });
    })
  );

  ipcMain.handle(
    'product:search',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = productListQuerySchema.parse(input);
      const { filter, page, pageSize, search } = query;

      if (!search) {
        return toPaginatedResult([], 0, page, pageSize);
      }

      const where = {
        ...(filter === 'inStock' ? { stock: { [Op.gt]: 0 } } : {}),
        title: { [Op.substring]: search },
      };

      const { rows, count } = await Product.findAndCountAll({
        ...toPaginationOptions({ page, pageSize }),
        where,
        order: [['title', 'ASC']],
      });

      return toPaginatedResult(
        rows.map((product: any) =>
          product.toJSON ? product.toJSON() : product
        ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'product:getInvoices',
    withAppReady(
      async (_event, productId: number, startDate: string, endDate: string) => {
        const items = await getInvoiceItems({
          where: {
            productId,
            createdAt: {
              [Op.between]: [
                `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
                `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
              ],
            },
          },
          order: [['createdAt', 'DESC']],
        });
        return items.map((i: any) => (i.toJSON ? i.toJSON() : i));
      }
    )
  );

  ipcMain.handle(
    'product:getPurchases',
    withAppReady(
      async (_event, productId: number, startDate: string, endDate: string) => {
        const items = await getPurchaseItems({
          where: {
            productId,
            createdAt: {
              [Op.between]: [
                `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
                `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
              ],
            },
          },
          order: [['createdAt', 'DESC']],
        });
        return items.map((i: any) => (i.toJSON ? i.toJSON() : i));
      }
    )
  );

  ipcMain.handle(
    'product:getAuditLog',
    withAppReady(
      async (_event, productId: number, startDate: string, endDate: string) => {
        const logs = await ProductAuditLog.findAll({
          where: {
            productId,
            createdAt: {
              [Op.between]: [
                `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
                `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
              ],
            },
          },
          order: [['createdAt', 'DESC']],
        });
        return logs.map((log: any) => (log.toJSON ? log.toJSON() : log));
      }
    )
  );
}
