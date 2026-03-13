import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import {
  getProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
} from '../../services/product.service';
import { getPurchaseItems } from '../../services/purchaseItem.service';
import { getInvoiceItems } from '../../services/invoiceItem.service';

export function registerProductHandlers(): void {
  ipcMain.handle('product:getAll', async (_event, filter?: string) => {
    const filters: any = {};
    if (filter === 'inStock') {
      filters.where = { stock: { [Op.gt]: 0 } };
    }
    const products = await getProducts({
      ...filters,
      order: [['title', 'ASC']],
    });
    return products.map((p: any) => (p.toJSON ? p.toJSON() : p));
  });

  ipcMain.handle('product:getById', async (_event, id: number) => {
    const product = await getProductById(id);
    return (product as any).toJSON ? (product as any).toJSON() : product;
  });

  ipcMain.handle('product:create', async (_event, values: any) => {
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
  });

  ipcMain.handle('product:update', async (_event, id: number, values: any) => {
    await updateProduct(id, values);
  });

  ipcMain.handle('product:delete', async (_event, id: number) => {
    await deleteProduct(id);
  });

  ipcMain.handle('product:search', async (_event, value: string) => {
    const schema = z.object({ value: z.string().min(1) });
    schema.parse({ value });
    const products = await getProducts({
      where: { title: { [Op.substring]: value } },
    });
    return products.map((p: any) => (p.toJSON ? p.toJSON() : p));
  });

  ipcMain.handle(
    'product:getInvoices',
    async (_event, productId: number, startDate: string, endDate: string) => {
      const items = await getInvoiceItems({
        where: {
          productId,
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
      });
      return items.map((i: any) => (i.toJSON ? i.toJSON() : i));
    }
  );

  ipcMain.handle(
    'product:getPurchases',
    async (_event, productId: number, startDate: string, endDate: string) => {
      const items = await getPurchaseItems({
        where: {
          productId,
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
      });
      return items.map((i: any) => (i.toJSON ? i.toJSON() : i));
    }
  );
}
