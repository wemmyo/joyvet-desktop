import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import Invoice, { IInvoice } from '../models/invoice';
import Customer from '../models/customer';
import Product from '../models/product';
import InvoiceItem, { IInvoiceItem } from '../models/invoiceItem';
import { createInvoiceValidation } from '../sliceValidation/index';
import sequelize from '../utils/database';
import {
  getInvoices as getInvoicesService,
  getInvoiceById,
} from '../services/invoice.service';

export const filterInvoiceFn = async (
  startDate: string,
  endDate: string,
  saleType: string
) => {
  // Schema for input validation
  const schema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    saleType: z.string(),
  });

  try {
    // Validate inputs
    schema.parse({ startDate, endDate, saleType });
    let invoices;

    // Implementing a default maximum range limit for dates to prevent heavy queries
    const MAX_DATE_RANGE = 90; // maximum date range in days
    const dateDifference = moment(endDate).diff(moment(startDate), 'days');

    if (dateDifference > MAX_DATE_RANGE) {
      throw new Error(
        `Date range too large. Please select a range smaller than ${MAX_DATE_RANGE} days.`
      );
    }

    // Optimized query handling based on input
    if (startDate && endDate && saleType === 'all') {
      invoices = await getInvoicesService({
        where: {
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 23:59:59`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });
    } else if (startDate && endDate && saleType !== 'all') {
      invoices = await getInvoicesService({
        where: {
          saleType,
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 23:59:59`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });
    } else if (saleType !== 'all' && !startDate && !endDate) {
      invoices = await getInvoicesService({
        where: {
          saleType,
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });
    } else {
      invoices = await getInvoicesService({
        order: [['createdAt', 'DESC']],
        include: [{ model: Customer }],
      });
    }

    return invoices;
  } catch (error) {
    // More descriptive error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while filtering invoices';
    toast.error(errorMessage);
    throw new Error(errorMessage); // Rethrow to allow specific error handling
  }
};

export const filterInvoiceById = async (id: number) => {
  const schema = z.object({
    id: z.number(),
  });

  try {
    schema.parse({ id });

    const invoices = await getInvoicesService({
      where: {
        id: {
          [Op.startsWith]: id,
        },
      },
      order: [['createdAt', 'DESC']],
      include: [{ model: Customer }],
    });

    return invoices;
  } catch (error) {
    // More descriptive error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while filtering invoices by ID';
    toast.error(errorMessage);
    throw new Error(errorMessage); // Rethrow to allow specific error handling
  }
};

export const getSingleInvoiceFn = async (id: number, cb?: () => void) => {
  try {
    // use zod to validate the input
    const schema = z.object({
      id: z.number(),
    });
    schema.parse({ id });

    const invoice = await getInvoiceById(id, {
      include: [
        { model: Customer },
        {
          model: Product,
        },
      ],
    });

    if (cb) {
      cb();
    }

    return invoice.toJSON();
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getInvoicesFn = async () => {
  try {
    const invoices = await getInvoicesService({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Customer,
        },
        {
          model: Product,
        },
      ],
    });

    return invoices;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteInvoiceFn = async (id: number, cb?: () => void) => {
  const schema = z.object({ id: z.number() });

  try {
    // Validate the input
    schema.parse({ id });

    await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(id, {
        include: [Product],
        transaction: t,
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Ensure stock is correctly managed when an invoice is deleted
      await Promise.all(
        invoice.products.map(async (product) => {
          const { invoiceItem } = product;
          const newStock = product.stock + invoiceItem.quantity;
          if (newStock < 0) {
            throw new Error(
              `Can't delete invoice. It would result in negative stock for product: ${product.title}`
            );
          }

          await Product.update(
            { stock: newStock },
            { where: { id: product.id }, transaction: t }
          );
        })
      );

      // Adjust the customer's balance if the invoice is on credit or transfer
      if (['credit', 'transfer'].includes(invoice.saleType)) {
        await Customer.decrement('balance', {
          by: invoice.amount,
          where: { id: invoice.customerId },
          transaction: t,
        });
      }

      // Delete the invoice and its associated items
      await invoice.destroy({ transaction: t });

      toast.success('Invoice deleted successfully.');
      if (cb) {
        cb();
      }
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while deleting the invoice';
    toast.error(errorMessage);
    throw new Error(errorMessage); // Rethrow to allow specific error handling
  }
};

export const deleteInvoiceItemFn = async ({
  productId,
  invoiceId,
  invoiceItemId,
  cb,
}) => {
  const schema = z.object({
    productId: z.number(),
    invoiceId: z.number(),
    invoiceItemId: z.number(),
  });

  try {
    // Validate the input
    schema.parse({ productId, invoiceId, invoiceItemId });

    await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const invoiceItem = await InvoiceItem.findByPk(invoiceItemId, {
        transaction: t,
      });
      if (!invoiceItem) {
        throw new Error('Invoice item not found');
      }

      // Update stock, ensuring it doesn't go negative
      const product = await Product.findByPk(productId, { transaction: t });
      if (!product) {
        throw new Error('Product not found');
      }
      const newStock = product.stock + invoiceItem.quantity;
      if (newStock < 0) {
        throw new Error(
          `Deleting this item would result in negative stock for product: ${product.title}`
        );
      }

      await Product.update(
        { stock: newStock },
        {
          where: { id: productId },
          transaction: t,
        }
      );

      // Update total amount and profit for the invoice
      const updatedAmount = invoice.amount - invoiceItem.amount;
      const updatedProfit = invoice.profit - invoiceItem.profit;
      await invoice.update(
        { amount: updatedAmount, profit: updatedProfit },
        { transaction: t }
      );

      // Update customer balance if the invoice is on credit or transfer
      if (['credit', 'transfer'].includes(invoice.saleType)) {
        await Customer.decrement('balance', {
          by: invoiceItem.amount,
          where: { id: invoice.customerId },
          transaction: t,
        });
      }

      // Delete the invoice item
      await invoiceItem.destroy({ transaction: t });

      toast.success('Invoice item deleted successfully');
      if (cb) {
        cb();
      }
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while deleting the invoice item';
    toast.error(errorMessage);
    throw new Error(errorMessage); // Rethrow to allow specific error handling
  }
};

export const addInvoiceItemFn = async (
  currentInvoice: Pick<
    IInvoice,
    'id' | 'saleType' | 'amount' | 'profit' | 'customer'
  >,
  currentInvoiceItem: Omit<IInvoiceItem, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const schema = z.object({
    invoiceId: z.number(),
    productId: z.number(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    amount: z.number().min(0),
    profit: z.number().min(0),
  });

  try {
    // Validate the input data
    schema.parse({
      invoiceId: currentInvoice.id,
      productId: currentInvoiceItem.product?.id,
      quantity: currentInvoiceItem.quantity,
      unitPrice: currentInvoiceItem.unitPrice,
      amount: currentInvoiceItem.amount,
      profit: currentInvoiceItem.profit,
    });

    await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(currentInvoice.id, {
        transaction: t,
      });
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const product = await Product.findByPk(currentInvoiceItem.product?.id, {
        transaction: t,
      });
      if (!product) {
        throw new Error('Product not found');
      }

      // Check for existing InvoiceItem
      const existingInvoiceItem = await InvoiceItem.findOne({
        where: {
          invoiceId: invoice.id,
          productId: product.id,
        },
        transaction: t,
      });

      if (existingInvoiceItem) {
        // Update the existing InvoiceItem
        const updatedQuantity =
          existingInvoiceItem.quantity + currentInvoiceItem.quantity;
        const updatedAmount = updatedQuantity * existingInvoiceItem.unitPrice;
        const updatedProfit =
          updatedQuantity * (existingInvoiceItem.unitPrice - product.buyPrice);

        await existingInvoiceItem.update(
          {
            quantity: updatedQuantity,
            amount: updatedAmount,
            profit: updatedProfit,
          },
          { transaction: t }
        );
      } else {
        // Create new invoice item
        const newInvoiceItem = {
          invoiceId: invoice.id,
          productId: product.id,
          quantity: currentInvoiceItem.quantity,
          unitPrice: currentInvoiceItem.unitPrice,
          amount: currentInvoiceItem.amount,
          profit: currentInvoiceItem.profit,
        };

        await InvoiceItem.create(newInvoiceItem, { transaction: t });
      }

      // Recalculate and update invoice totals
      const updatedInvoiceItems = await InvoiceItem.findAll({
        where: { invoiceId: invoice.id },
        transaction: t,
      });

      const totalAmount = updatedInvoiceItems.reduce(
        (acc, item) => acc + item.amount,
        0
      );
      const totalProfit = updatedInvoiceItems.reduce(
        (acc, item) => acc + item.profit,
        0
      );

      await invoice.update(
        {
          amount: totalAmount,
          profit: totalProfit,
        },
        { transaction: t }
      );

      // Update product stock
      const newStock = product.stock - currentInvoiceItem.quantity;
      if (newStock < 0) {
        throw new Error(
          `Not enough stock for product: ${product.title}. Only ${product.stock} left in stock.`
        );
      }

      await product.update({ stock: newStock }, { transaction: t });

      toast.success('Successfully updated item in the invoice');
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while adding/updating item in the invoice';
    toast.error(errorMessage);
    throw new Error(errorMessage); // Rethrow to allow specific error handling
  }
};

export const createInvoiceFn = async (
  invoiceItems: Omit<IInvoiceItem, 'id' | 'createdAt' | 'updatedAt'>[],
  invoice?: Partial<IInvoice>,
  cb?: (id: number) => void
) => {
  // validate inputs with zod
  const schema = z.object({
    invoiceItems: z.array(
      z.object({
        quantity: z.number().min(0),
        unitPrice: z.number().min(1),
        amount: z.number().min(1),
        profit: z.number(),
      })
    ),
    invoice: z.object({
      customerId: z.number().min(1),
      saleType: z.string().min(1),
      amount: z.number().min(0),
      profit: z.number(),
    }),
  });

  const calculatedTotalAmount = invoiceItems.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const extendedSchema = schema.refine(
    (data) => data.invoice.amount === calculatedTotalAmount,
    {
      message:
        "Invoice amount does not match the total of invoice items' amounts",
    }
  );

  try {
    extendedSchema.parse({
      invoiceItems,
      invoice: { ...invoice, amount: calculatedTotalAmount },
    });
    createInvoiceValidation(invoiceItems, invoice);
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    // transaction
    await sequelize.transaction(async (t) => {
      const customer = await Customer.findByPk(invoice?.customerId, {
        transaction: t,
      });

      const customerInvoice = await customer.createInvoice(
        {
          saleType: invoice?.saleType,
          amount: invoice?.amount,
          profit: invoice?.profit,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      const productInvoiceItems: IInvoiceItem[] = [];

      await Promise.all(
        invoiceItems.map(async (item) => {
          const product = await Product.findByPk(item.product?.id, {
            transaction: t,
          });
          if (!item.quantity) {
            throw new Error(`Quantity missing for for ${product.title}`);
          }
          // if item quantity is higher than stock quantity, throw error
          if (item.quantity > product.stock) {
            throw new Error(
              `Not enough in stock for ${product.title}. ${product.stock} remaining`
            );
          }
          await Product.decrement('stock', {
            by: item.quantity,
            where: { id: item.product?.id },
            transaction: t,
          });
          product.invoiceItem = {
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            profit: item.profit,
          };
          productInvoiceItems.push(product);
        })
      );
      await customerInvoice.addProducts(productInvoiceItems, {
        transaction: t,
      });

      if (invoice?.saleType === 'credit' || invoice?.saleType === 'transfer') {
        await Customer.increment('balance', {
          by: invoice.amount,
          where: { id: invoice.customerId },
          transaction: t,
        });
      }

      toast.success('Invoice created');

      if (cb) {
        cb(customerInvoice.id);
      }

      return customerInvoice;
    });
  } catch (error) {
    toast.error(error.message);
  }
};
