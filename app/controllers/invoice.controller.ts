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
  // use zod to validate the input
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
      include: [
        {
          model: Customer,
        },
      ],
    });

    return invoices;
  } catch (error) {
    toast.error(error.message || '');
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
  // use zod to validate the input
  const schema = z.object({
    id: z.number(),
  });
  try {
    schema.parse({ id });
    await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Product,
          },
        ],
      });

      await Promise.all(
        invoice.products.map(async (each: any) => {
          await Product.increment('stock', {
            by: each.invoiceItem.quantity,
            where: { id: each.id },
            transaction: t,
          });
        })
      );

      // update customer balance

      if (invoice.saleType === 'credit' || invoice.saleType === 'transfer') {
        await Customer.decrement('balance', {
          by: invoice.amount,
          where: {
            id: invoice.customerId,
          },
          transaction: t,
        });
      }

      await invoice.destroy({ transaction: t });
    });
    toast.success('Invoice deleted');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteInvoiceItemFn = async ({
  productId,
  invoiceId,
  invoiceItemId,
  cb,
}: {
  productId: number;
  invoiceId: number;
  invoiceItemId: number;
  cb?: () => void;
}) => {
  // use zod to validate the input
  const schema = z.object({
    productId: z.number(),
    invoiceId: z.number(),
    invoiceItemId: z.number(),
  });
  try {
    schema.parse({ productId, invoiceId, invoiceItemId });
    await sequelize.transaction(async (t) => {
      const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
      const invoiceItem = await InvoiceItem.findByPk(invoiceItemId, {
        transaction: t,
      });

      // update stock
      const updateStock = Product.increment('stock', {
        by: invoiceItem.quantity,
        where: {
          id: productId,
        },
        transaction: t,
      });

      // update total amount
      // update total profit
      const updateAmount = invoice.decrement(
        {
          amount: invoiceItem.amount,
          profit: invoiceItem.profit,
        },
        { transaction: t }
      );

      // update customer balance
      const updateBalance = async () => {
        if (invoice.saleType === 'credit' || invoice.saleType === 'transfer') {
          await Customer.decrement('balance', {
            by: invoiceItem.amount,
            where: {
              id: invoice.customerId,
            },
            transaction: t,
          });
        }
      };

      // delete invoice
      const deleteInvoice = invoiceItem.destroy({ transaction: t });

      await Promise.all([
        updateStock,
        updateAmount,
        updateBalance(),
        deleteInvoice,
      ]);
    });
    toast.success('Successfully removed item');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const addInvoiceItemFn = async (
  currentInvoice: Pick<
    IInvoice,
    'id' | 'saleType' | 'amount' | 'profit' | 'customer'
  >,
  currentInvoiceItem: Partial<IInvoiceItem>
) => {
  try {
    await sequelize.transaction(async (t) => {
      // find the Invoice
      const invoice = await Invoice.findByPk(currentInvoice.id, {
        include: [Product],
      });
      if (!invoice)
        throw new Error(`Invoice with id ${currentInvoice.id} not found`);

      // find the Product
      const product = await Product.findByPk(currentInvoiceItem.product?.id);
      if (!product)
        throw new Error(
          `Product with id ${currentInvoiceItem.product?.id} not found`
        );

      // prepare the InvoiceItem data
      const newInvoiceItem = {
        quantity: currentInvoiceItem.quantity,
        unitPrice: currentInvoiceItem.unitPrice,
        amount: currentInvoiceItem.amount,
        profit: currentInvoiceItem.profit,
      };

      // if the product is already in the invoice, update the quantity and amount
      const existingInvoiceItem = await invoice.products.find(
        (item) => item.id === product.id
      );

      const updateInvoiceItem = async () => {
        if (existingInvoiceItem) {
          // update the InvoiceItem
          InvoiceItem.increment(
            {
              quantity: currentInvoiceItem.quantity,
              amount: currentInvoiceItem.amount,
              profit: currentInvoiceItem.profit,
            },
            {
              transaction: t,
              where: { id: existingInvoiceItem.invoiceItem?.id },
            }
          );
        } else {
          // Add product to invoice (this will create an InvoiceItem)
          invoice.addProduct(product, {
            through: newInvoiceItem,
            transaction: t,
          });
        }
      };

      // update the Invoice
      const updatedInvoice = Invoice.increment(
        {
          amount: currentInvoiceItem.amount,
          profit: currentInvoiceItem.profit,
        },
        {
          transaction: t,
          where: { id: currentInvoice.id },
        }
      );

      // update the Product
      const updatedProduct = Product.decrement(
        'stock',
        {
          by: currentInvoiceItem.quantity,
          where: { id: currentInvoiceItem.product?.id },
        },
        { transaction: t }
      );

      // update customer balance
      const updateBalance = async () => {
        if (invoice.saleType === 'credit' || invoice.saleType === 'transfer') {
          return Customer.increment('balance', {
            by: currentInvoiceItem.amount,
            where: {
              id: invoice.customer.id,
            },
            transaction: t,
          });
        }
      };

      await Promise.all([
        updatedInvoice,
        updatedProduct,
        updateInvoiceItem(),
        updateBalance(),
      ]);

      toast.success('Successfully added item');
    });
  } catch (error) {
    toast.error(error.message || '');
    throw error;
  }
};

export const createInvoiceFn = async (
  invoiceItems: Partial<IInvoiceItem>[],
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

  try {
    schema.parse({ invoiceItems, invoice });
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

export const updateInvoiceFn = async (
  invoiceItems: Partial<IInvoiceItem>[],
  invoice: IInvoice,
  cb?: (id: number) => void
) => {
  // validate inputs with zod
  const schema = z.object({
    invoiceItems: z.array(
      z.object({
        quantity: z.number(),
        unitPrice: z.number(),
        amount: z.number(),
        profit: z.number(),
      })
    ),
    invoice: z.object({
      id: z.number(),
      customerId: z.number(),
      saleType: z.string(),
      amount: z.number(),
      profit: z.number(),
    }),
  });

  const hasInvoiceItems = invoiceItems.length > 0;

  try {
    schema.parse({ invoiceItems, invoice });
    await deleteInvoiceFn(invoice.id);
    if (hasInvoiceItems) {
      await createInvoiceFn(invoiceItems, invoice, cb);
    }
  } catch (error) {
    toast.error(error.message);
  }
};
