import dayjs from 'dayjs';
import { ipcMain } from 'electron';
import { Op } from 'sequelize';
import Customer from '../../models/customer';
import Invoice from '../../models/invoice';
import InvoiceItem from '../../models/invoiceItem';
import Product from '../../models/product';
import ProductAuditLog from '../../models/productAuditLog';
import { getInvoiceById } from '../../services/invoice.service';
import {
  createInvoiceAuditLog,
  getInvoiceAuditLogs,
} from '../../services/invoiceAuditLog.service';
import { createInvoiceValidation } from '../../sliceValidation/index';
import database from '../database';
import { withAppReady } from '../runtime';
import {
  invoiceListQuerySchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';

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
      const MAX_DATE_RANGE = 365;

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
    withAppReady(
      async (_event, invoiceItems: any[], invoice: any, postedBy?: string) => {
        createInvoiceValidation(invoiceItems, invoice);
        return await database.transaction(async (t: any) => {
          const customer = await Customer.findByPk(invoice?.customerId, {
            transaction: t,
          });
          if (!customer) throw new Error('Customer not found');

          // Validate all items sequentially so duplicate-product stock checks
          // see each preceding decrement within this transaction.
          let totalAmount = 0;
          let totalProfit = 0;
          const resolvedItems: Array<{
            productId: number;
            productTitle: string;
            quantity: number;
            unitPrice: number;
            computedAmount: number;
            computedProfit: number;
            stockBefore: number;
            stockAfter: number;
          }> = [];

          for (const item of invoiceItems) {
            const product = await Product.findByPk(item.product?.id, {
              transaction: t,
            });
            if (!product) {
              throw new Error(`Product not found: ${item.product?.id}`);
            }
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

            // Capture stock levels before decrement. Because we use findByPk
            // inside the same transaction each iteration, each read reflects
            // the decrements applied by previous iterations — ensuring
            // duplicate-product quantities are checked cumulatively.
            const stockBefore = (product as any).stock;
            const stockAfter = stockBefore - item.quantity;

            await Product.decrement('stock', {
              by: item.quantity,
              where: { id: (product as any).id },
              transaction: t,
            });

            const computedAmount = item.quantity * item.unitPrice;
            const computedProfit =
              item.quantity * (item.unitPrice - (product as any).buyPrice);

            totalAmount += computedAmount;
            totalProfit += computedProfit;

            resolvedItems.push({
              productId: (product as any).id,
              productTitle: (product as any).title,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              computedAmount,
              computedProfit,
              stockBefore,
              stockAfter,
            });
          }

          const customerInvoice = await (customer as any).createInvoice(
            {
              saleType: invoice?.saleType,
              amount: totalAmount,
              profit: totalProfit,
              postedBy: invoice?.postedBy ?? postedBy,
            },
            { transaction: t }
          );

          for (const resolved of resolvedItems) {
            await ProductAuditLog.create(
              {
                productId: resolved.productId,
                changeType: 'stock_change',
                delta: -resolved.quantity,
                stockBefore: resolved.stockBefore,
                stockAfter: resolved.stockAfter,
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
                productId: resolved.productId,
                quantity: resolved.quantity,
                unitPrice: resolved.unitPrice,
                amount: resolved.computedAmount,
                profit: resolved.computedProfit,
              },
              { transaction: t }
            );
          }

          if (
            invoice?.saleType === 'credit' ||
            invoice?.saleType === 'transfer'
          ) {
            await Customer.increment('balance', {
              by: totalAmount,
              where: { id: invoice.customerId },
              transaction: t,
            });
          }

          await createInvoiceAuditLog({
            invoiceId: (customerInvoice as any).id,
            action: 'created',
            details: { saleType: invoice?.saleType, amount: totalAmount },
            performedBy: invoice?.postedBy ?? postedBy ?? 'unknown',
            transaction: t,
          });

          return customerInvoice.toJSON();
        });
      }
    )
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
            if (
              typeof invoiceItem.quantity !== 'number' ||
              Number.isNaN(invoiceItem.quantity)
            ) {
              throw new Error(
                `Invalid invoice item quantity for product: ${product.title}. Cannot safely restore stock.`
              );
            }

            const stockBefore = product.stock;
            const stockAfter = stockBefore + invoiceItem.quantity;

            // Use atomic increment so concurrent writes don't overwrite each other.
            await Product.increment('stock', {
              by: invoiceItem.quantity,
              where: { id: product.id },
              transaction: t,
            });

            await ProductAuditLog.create(
              {
                productId: product.id,
                changeType: 'stock_change',
                delta: invoiceItem.quantity,
                stockBefore,
                stockAfter,
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

        await createInvoiceAuditLog({
          invoiceId: id,
          action: 'deleted',
          details: {
            saleType: (invoice as any).saleType,
            amount: (invoice as any).amount,
          },
          performedBy: (invoice as any).postedBy ?? 'unknown',
          transaction: t,
        });

        await (invoice as any).destroy({ transaction: t });
      });
    })
  );

  ipcMain.handle(
    'invoice:deleteItem',
    withAppReady(
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

          const stockBefore = (product as any).stock;
          const stockAfter = stockBefore + (invoiceItem as any).quantity;

          // Use atomic increment to avoid overwriting concurrent stock changes.
          await Product.increment('stock', {
            by: (invoiceItem as any).quantity,
            where: { id: productId },
            transaction: t,
          });

          await ProductAuditLog.create(
            {
              productId,
              changeType: 'stock_change',
              delta: (invoiceItem as any).quantity,
              stockBefore,
              stockAfter,
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

          await createInvoiceAuditLog({
            invoiceId,
            action: 'item_deleted',
            details: { productId, quantity: (invoiceItem as any).quantity },
            performedBy: (invoice as any).postedBy ?? 'unknown',
            transaction: t,
          });

          await (invoiceItem as any).destroy({ transaction: t });
        });
      }
    )
  );

  ipcMain.handle(
    'invoice:addItem',
    withAppReady(
      async (_event, currentInvoice: any, currentInvoiceItem: any) => {
        await database.transaction(async (t: any) => {
          const invoice = await Invoice.findByPk(currentInvoice.id, {
            transaction: t,
          });
          if (!invoice) throw new Error('Invoice not found');

          const product = await Product.findByPk(
            currentInvoiceItem.product?.id,
            {
              transaction: t,
            }
          );
          if (!product) throw new Error('Product not found');

          const newStock = (product as any).stock - currentInvoiceItem.quantity;
          if (newStock < 0) {
            throw new Error(
              `Not enough stock for: ${(product as any).title}. Only ${
                (product as any).stock
              } left.`
            );
          }

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
            // Compute amount and profit server-side rather than trusting client values.
            const computedAmount =
              currentInvoiceItem.quantity * currentInvoiceItem.unitPrice;
            const computedProfit =
              currentInvoiceItem.quantity *
              (currentInvoiceItem.unitPrice - (product as any).buyPrice);

            await InvoiceItem.create(
              {
                invoiceId: (invoice as any).id,
                productId: (product as any).id,
                quantity: currentInvoiceItem.quantity,
                unitPrice: currentInvoiceItem.unitPrice,
                amount: computedAmount,
                profit: computedProfit,
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

          // Capture old amount before update so we can compute the exact balance delta.
          const oldInvoiceAmount = (invoice as any).amount;

          await (invoice as any).update(
            { amount: totalAmount, profit: totalProfit },
            { transaction: t }
          );

          await Product.decrement('stock', {
            by: currentInvoiceItem.quantity,
            where: { id: (product as any).id },
            transaction: t,
          });

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
            // Use the actual invoice total change rather than the client-provided
            // item amount. This handles merged items correctly.
            const balanceDelta = totalAmount - oldInvoiceAmount;
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

          await createInvoiceAuditLog({
            invoiceId: (invoice as any).id,
            action: 'item_added',
            details: {
              productId: (product as any).id,
              quantity: currentInvoiceItem.quantity,
              unitPrice: currentInvoiceItem.unitPrice,
            },
            performedBy: currentInvoice.postedBy ?? 'unknown',
            transaction: t,
          });
        });
      }
    )
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

          if (delta > 0) {
            await Product.decrement('stock', {
              by: delta,
              where: { id: productId },
              transaction: t,
            });
          } else if (delta < 0) {
            await Product.increment('stock', {
              by: Math.abs(delta),
              where: { id: productId },
              transaction: t,
            });
          }

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

          await createInvoiceAuditLog({
            invoiceId,
            action: 'item_updated',
            details: { productId, oldQuantity, newQuantity },
            performedBy: postedBy ?? 'unknown',
            transaction: t,
          });
        });
      }
    )
  );

  ipcMain.handle(
    'invoice:getAuditLog',
    withAppReady(async (_e, invoiceId?: number) => {
      return getInvoiceAuditLogs(invoiceId);
    })
  );
}
