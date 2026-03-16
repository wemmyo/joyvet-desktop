import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import { z } from 'zod';
import database from '../database';
import Invoice from '../../models/invoice';
import Customer from '../../models/customer';
import Product from '../../models/product';
import InvoiceItem from '../../models/invoiceItem';
import {
  getInvoices as getInvoicesService,
  getInvoiceById,
} from '../../services/invoice.service';
import { createInvoiceValidation } from '../../sliceValidation/index';

export function registerInvoiceHandlers(): void {
  ipcMain.handle('invoice:getAll', async () => {
    const invoices = await getInvoicesService({
      order: [['createdAt', 'DESC']],
      include: [{ model: Customer }, { model: Product }],
    });
    return invoices.map((i: any) => i.toJSON());
  });

  ipcMain.handle('invoice:getSingle', async (_event, id: number) => {
    const invoice = await getInvoiceById(id, {
      include: [{ model: Customer }, { model: Product }],
    });
    return (invoice as any).toJSON();
  });

  ipcMain.handle(
    'invoice:filter',
    async (_event, startDate: string, endDate: string, saleType: string) => {
      const schema = z.object({
        startDate: z.string(),
        endDate: z.string(),
        saleType: z.string(),
      });
      schema.parse({ startDate, endDate, saleType });

      const MAX_DATE_RANGE = 90;

      if (startDate && endDate) {
        const dateDifference = dayjs(endDate).diff(dayjs(startDate), 'days');
        if (dateDifference > MAX_DATE_RANGE) {
          throw new Error(
            `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
          );
        }
      }

      let whereClause: any = {};

      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [
            `${dayjs(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${dayjs(endDate).format('YYYY-MM-DD')} 23:59:59`,
          ],
        };
      }

      if (saleType !== 'all') {
        whereClause.saleType = saleType;
      }

      const invoices = await getInvoicesService({
        where: Object.keys(whereClause).length ? whereClause : undefined,
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });
      return invoices.map((i: any) => i.toJSON());
    }
  );

  ipcMain.handle('invoice:filterById', async (_event, id: number) => {
    const invoices = await getInvoicesService({
      where: { id: { [Op.startsWith]: id } },
      order: [['createdAt', 'DESC']],
      include: [{ model: Customer }],
    });
    return invoices.map((i: any) => i.toJSON());
  });

  ipcMain.handle(
    'invoice:create',
    async (_event, invoiceItems: any[], invoice: any) => {
      createInvoiceValidation(invoiceItems, invoice);
      return database.transaction(async (t: any) => {
        const customer = await Customer.findByPk(invoice?.customerId, {
          transaction: t,
        });

        const customerInvoice = await (customer as any).createInvoice(
          {
            saleType: invoice?.saleType,
            amount: invoice?.amount,
            profit: invoice?.profit,
            postedBy: invoice?.postedBy,
          },
          { transaction: t }
        );

        const productInvoiceItems: any[] = [];

        await Promise.all(
          invoiceItems.map(async (item) => {
            const product = await Product.findByPk(item.product?.id, {
              transaction: t,
            });
            if (!item.quantity) {
              throw new Error(`Quantity missing for ${(product as any).title}`);
            }
            if (item.quantity > (product as any).stock) {
              throw new Error(
                `Not enough in stock for ${(product as any).title}. ${
                  (product as any).stock
                } remaining`
              );
            }
            await Product.decrement('stock', {
              by: item.quantity,
              where: { id: item.product?.id },
              transaction: t,
            });
            (product as any).invoiceItem = {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              profit: item.profit,
            };
            productInvoiceItems.push(product);
          })
        );

        await (customerInvoice as any).addProducts(productInvoiceItems, {
          transaction: t,
        });

        if (
          invoice?.saleType === 'credit' ||
          invoice?.saleType === 'transfer'
        ) {
          await Customer.increment('balance', {
            by: invoice.amount,
            where: { id: invoice.customerId },
            transaction: t,
          });
        }

        return customerInvoice.toJSON();
      });
    }
  );

  ipcMain.handle('invoice:delete', async (_event, id: number) => {
    await database.transaction(async (t: any) => {
      const invoice = await Invoice.findByPk(id, {
        include: [Product],
        transaction: t,
      });

      if (!invoice) throw new Error('Invoice not found');

      await Promise.all(
        (invoice as any).products.map(async (product: any) => {
          const { invoiceItem } = product;
          const newStock = product.stock + invoiceItem.quantity;
          if (newStock < 0) {
            throw new Error(
              `Can't delete invoice. Negative stock for: ${product.title}`
            );
          }
          await Product.update(
            { stock: newStock },
            { where: { id: product.id }, transaction: t }
          );
        })
      );

      if (['credit', 'transfer'].includes((invoice as any).saleType)) {
        await Customer.decrement('balance', {
          by: (invoice as any).amount,
          where: { id: (invoice as any).customerId },
          transaction: t,
        });
      }

      await (invoice as any).destroy({ transaction: t });
    });
  });

  ipcMain.handle(
    'invoice:deleteItem',
    async (_event, { productId, invoiceId, invoiceItemId }: any) => {
      await database.transaction(async (t: any) => {
        const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
        if (!invoice) throw new Error('Invoice not found');

        const invoiceItem = await InvoiceItem.findByPk(invoiceItemId, {
          transaction: t,
        });
        if (!invoiceItem) throw new Error('Invoice item not found');

        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) throw new Error('Product not found');

        const newStock = (product as any).stock + (invoiceItem as any).quantity;
        if (newStock < 0) {
          throw new Error(
            `Deleting this item would result in negative stock for: ${
              (product as any).title
            }`
          );
        }

        await Product.update(
          { stock: newStock },
          { where: { id: productId }, transaction: t }
        );

        const updatedAmount =
          (invoice as any).amount - (invoiceItem as any).amount;
        const updatedProfit =
          (invoice as any).profit - (invoiceItem as any).profit;

        await (invoice as any).update(
          { amount: updatedAmount, profit: updatedProfit },
          { transaction: t }
        );

        if (['credit', 'transfer'].includes((invoice as any).saleType)) {
          await Customer.decrement('balance', {
            by: (invoiceItem as any).amount,
            where: { id: (invoice as any).customerId },
            transaction: t,
          });
        }

        await (invoiceItem as any).destroy({ transaction: t });
      });
    }
  );

  ipcMain.handle(
    'invoice:addItem',
    async (_event, currentInvoice: any, currentInvoiceItem: any) => {
      await database.transaction(async (t: any) => {
        const invoice = await Invoice.findByPk(currentInvoice.id, {
          transaction: t,
        });
        if (!invoice) throw new Error('Invoice not found');

        const product = await Product.findByPk(currentInvoiceItem.product?.id, {
          transaction: t,
        });
        if (!product) throw new Error('Product not found');

        const existingItem = await InvoiceItem.findOne({
          where: {
            invoiceId: (invoice as any).id,
            productId: (product as any).id,
          },
          transaction: t,
        });

        if (existingItem) {
          const updatedQuantity =
            (existingItem as any).quantity + currentInvoiceItem.quantity;
          const updatedAmount =
            updatedQuantity * (existingItem as any).unitPrice;
          const updatedProfit =
            updatedQuantity *
            ((existingItem as any).unitPrice - (product as any).buyPrice);

          await (existingItem as any).update(
            {
              quantity: updatedQuantity,
              amount: updatedAmount,
              profit: updatedProfit,
            },
            { transaction: t }
          );
        } else {
          await InvoiceItem.create(
            {
              invoiceId: (invoice as any).id,
              productId: (product as any).id,
              quantity: currentInvoiceItem.quantity,
              unitPrice: currentInvoiceItem.unitPrice,
              amount: currentInvoiceItem.amount,
              profit: currentInvoiceItem.profit,
            },
            { transaction: t }
          );
        }

        const updatedItems = await InvoiceItem.findAll({
          where: { invoiceId: (invoice as any).id },
          transaction: t,
        });

        const totalAmount = updatedItems.reduce(
          (acc: number, item: any) => acc + item.amount,
          0
        );
        const totalProfit = updatedItems.reduce(
          (acc: number, item: any) => acc + item.profit,
          0
        );

        await (invoice as any).update(
          { amount: totalAmount, profit: totalProfit },
          { transaction: t }
        );

        const newStock = (product as any).stock - currentInvoiceItem.quantity;
        if (newStock < 0) {
          throw new Error(
            `Not enough stock for: ${(product as any).title}. Only ${
              (product as any).stock
            } left.`
          );
        }

        await (product as any).update({ stock: newStock }, { transaction: t });

        if (['credit', 'transfer'].includes(currentInvoice.saleType)) {
          await Customer.increment('balance', {
            by: currentInvoiceItem.amount,
            where: { id: (invoice as any).customerId },
            transaction: t,
          });
        }
      });
    }
  );
}
