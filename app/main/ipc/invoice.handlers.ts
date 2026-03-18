import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import database from '../database';
import Invoice from '../../models/invoice';
import Customer from '../../models/customer';
import Product from '../../models/product';
import InvoiceItem from '../../models/invoiceItem';
import ProductAuditLog from '../../models/productAuditLog';
import { getInvoiceById } from '../../services/invoice.service';
import { createInvoiceValidation } from '../../sliceValidation/index';
import {
  invoiceListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';
import { withAppReady } from '../runtime';

export function registerInvoiceHandlers(): void {
  ipcMain.handle(
    'invoice:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = invoiceListQuerySchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await Invoice.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });

      return toPaginatedResult(
        rows.map((invoice: any) => invoice.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'invoice:getSingle',
    withAppReady(async (_event, id: number) => {
      const invoice = await getInvoiceById(id, {
        include: [{ model: Customer }, { model: Product }],
      });
      if (!invoice) throw new Error('Invoice not found');
      return (invoice as any).toJSON();
    })
  );

  ipcMain.handle(
    'invoice:filter',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = invoiceListQuerySchema.parse(input);
      const { endDate, page, pageSize, saleType, search, startDate } = query;
      const whereClause: Record<string, unknown> = {};
      const MAX_DATE_RANGE = 90;

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

      if (saleType !== 'all') {
        whereClause.saleType = saleType;
      }

      if (search) {
        const invoiceId = Number(search);

        if (Number.isNaN(invoiceId)) {
          return toPaginatedResult([], 0, page, pageSize);
        }

        whereClause.id = invoiceId;
      }

      const { rows, count } = await Invoice.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });

      return toPaginatedResult(
        rows.map((invoice: any) => invoice.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'invoice:filterById',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = invoiceListQuerySchema.parse(input);
      const { page, pageSize, search } = query;
      const invoiceId = Number(search);

      if (!search || Number.isNaN(invoiceId)) {
        return toPaginatedResult([], 0, page, pageSize);
      }

      const { rows, count } = await Invoice.findAndCountAll({
        distinct: true,
        ...toPaginationOptions({ page, pageSize }),
        where: { id: invoiceId },
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });

      return toPaginatedResult(
        rows.map((invoice: any) => invoice.toJSON()),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'invoice:create',
    withAppReady(async (_event, invoiceItems: any[], invoice: any, postedBy?: string) => {
      createInvoiceValidation(invoiceItems, invoice);
      return await database.transaction(async (t: any) => {
        const customer = await Customer.findByPk(invoice?.customerId, {
          transaction: t,
        });

        const customerInvoice = await (customer as any).createInvoice(
          {
            saleType: invoice?.saleType,
            amount: invoice?.amount,
            profit: invoice?.profit,
            postedBy: invoice?.postedBy ?? postedBy,
          },
          { transaction: t }
        );

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

            const stockBefore = (product as any).stock;
            const stockAfter = stockBefore - item.quantity;

            await Product.decrement('stock', {
              by: item.quantity,
              where: { id: item.product?.id },
              transaction: t,
            });

            await ProductAuditLog.create(
              {
                productId: (product as any).id,
                changeType: 'stock_change',
                delta: -item.quantity,
                stockBefore,
                stockAfter,
                reason: 'invoice_create',
                referenceId: (customerInvoice as any).id,
                referenceType: 'invoice',
                postedBy: invoice?.postedBy ?? postedBy ?? 'unknown',
              },
              { transaction: t }
            );

            await InvoiceItem.create(
              {
                invoiceId: (customerInvoice as any).id,
                productId: (product as any).id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                profit: item.profit,
              },
              { transaction: t }
            );
          })
        );

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
    })
  );

  ipcMain.handle(
    'invoice:delete',
    withAppReady(async (_event, id: number) => {
      await database.transaction(async (t: any) => {
        const invoice = await Invoice.findByPk(id, {
          include: [Product],
          transaction: t,
        });

        if (!invoice) throw new Error('Invoice not found');

        await Promise.all(
          (invoice as any).products.map(async (product: any) => {
            const { invoiceItem } = product;

            if (!invoiceItem) {
              return;
            }
            if (typeof invoiceItem.quantity !== 'number' || isNaN(invoiceItem.quantity)) {
              throw new Error(
                `Invalid invoice item quantity for product: ${product.title}. Cannot safely restore stock.`
              );
            }

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

            await ProductAuditLog.create(
              {
                productId: product.id,
                changeType: 'stock_change',
                delta: invoiceItem.quantity,
                stockBefore: product.stock,
                stockAfter: newStock,
                reason: 'invoice_delete',
                referenceId: id,
                referenceType: 'invoice',
                postedBy: (invoice as any).postedBy ?? 'unknown',
              },
              { transaction: t }
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
    })
  );

  ipcMain.handle(
    'invoice:deleteItem',
    withAppReady(async (_event, { productId, invoiceId, invoiceItemId }: any) => {
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

        await ProductAuditLog.create(
          {
            productId,
            changeType: 'stock_change',
            delta: (invoiceItem as any).quantity,
            stockBefore: (product as any).stock,
            stockAfter: newStock,
            reason: 'invoice_delete_item',
            referenceId: invoiceId,
            referenceType: 'invoice',
            postedBy: (invoice as any).postedBy ?? 'unknown',
          },
          { transaction: t }
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
    })
  );

  ipcMain.handle(
    'invoice:addItem',
    withAppReady(async (_event, currentInvoice: any, currentInvoiceItem: any) => {
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

        await ProductAuditLog.create(
          {
            productId: (product as any).id,
            changeType: 'stock_change',
            delta: -currentInvoiceItem.quantity,
            stockBefore: (product as any).stock,
            stockAfter: newStock,
            reason: 'invoice_add_item',
            referenceId: (invoice as any).id,
            referenceType: 'invoice',
            postedBy: currentInvoice.postedBy ?? 'unknown',
          },
          { transaction: t }
        );

        if (['credit', 'transfer'].includes(currentInvoice.saleType)) {
          await Customer.increment('balance', {
            by: currentInvoiceItem.amount,
            where: { id: (invoice as any).customerId },
            transaction: t,
          });
        }
      });
    })
  );

  ipcMain.handle(
    'invoice:updateItem',
    withAppReady(
      async (
        _event,
        {
          invoiceItemId,
          invoiceId,
          productId,
          newQuantity,
          postedBy,
        }: {
          invoiceItemId: number;
          invoiceId: number;
          productId: number;
          newQuantity: number;
          postedBy: string;
        }
      ) => {
        await database.transaction(async (t: any) => {
          const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
          if (!invoice) throw new Error('Invoice not found');

          const invoiceItem = await InvoiceItem.findByPk(invoiceItemId, {
            transaction: t,
          });
          if (!invoiceItem) throw new Error('Invoice item not found');

          const product = await Product.findByPk(productId, { transaction: t });
          if (!product) throw new Error('Product not found');

          const oldQuantity = (invoiceItem as any).quantity;
          const delta = newQuantity - oldQuantity;

          if (delta > 0 && (product as any).stock < delta) {
            throw new Error(
              `Not enough stock for: ${(product as any).title}. Only ${
                (product as any).stock
              } available.`
            );
          }

          const stockBefore = (product as any).stock;
          const stockAfter = stockBefore - delta;

          await Product.update(
            { stock: stockAfter },
            { where: { id: productId }, transaction: t }
          );

          const unitPrice = (invoiceItem as any).unitPrice;
          const newAmount = newQuantity * unitPrice;
          const newProfit =
            (unitPrice - (product as any).buyPrice) * newQuantity;

          await (invoiceItem as any).update(
            { quantity: newQuantity, amount: newAmount, profit: newProfit },
            { transaction: t }
          );

          const allItems = await InvoiceItem.findAll({
            where: { invoiceId },
            transaction: t,
          });

          const totalAmount = allItems.reduce(
            (acc: number, item: any) => acc + item.amount,
            0
          );
          const totalProfit = allItems.reduce(
            (acc: number, item: any) => acc + item.profit,
            0
          );

          await (invoice as any).update(
            { amount: totalAmount, profit: totalProfit },
            { transaction: t }
          );

          if (['credit', 'transfer'].includes((invoice as any).saleType)) {
            const balanceDelta = newAmount - (invoiceItem as any).amount;
            if (balanceDelta > 0) {
              await Customer.increment('balance', {
                by: balanceDelta,
                where: { id: (invoice as any).customerId },
                transaction: t,
              });
            } else if (balanceDelta < 0) {
              await Customer.decrement('balance', {
                by: Math.abs(balanceDelta),
                where: { id: (invoice as any).customerId },
                transaction: t,
              });
            }
          }

          await ProductAuditLog.create(
            {
              productId,
              changeType: 'stock_change',
              delta: -delta,
              stockBefore,
              stockAfter,
              reason: 'invoice_update_item',
              referenceId: invoiceId,
              referenceType: 'invoice',
              postedBy: postedBy ?? 'unknown',
            },
            { transaction: t }
          );
        });
      }
    )
  );
}
