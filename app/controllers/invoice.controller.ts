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
  // use zod to validate the input
  const schema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    saleType: z.string(),
  });
  schema.parse({ startDate, endDate, saleType });

  try {
    let invoices;

    if (startDate && endDate && saleType === 'all') {
      // console.log('RAN FUNCTION 1');

      invoices = await getInvoicesService({
        where: {
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Customer,
          },
        ],
      });
    } else if (startDate && endDate && saleType !== 'all') {
      // console.log('RAN FUNCTION 2');

      invoices = await getInvoicesService({
        where: {
          saleType,
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
            ],
          },
        },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Customer,
          },
        ],
      });
    } else if (saleType !== 'all' && !startDate && !endDate) {
      // console.log('RAN FUNCTION 3');

      invoices = await getInvoicesService({
        where: {
          saleType,
        },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Customer,
          },
        ],
      });
    } else {
      // console.log('RAN FUNCTION 4');

      invoices = await getInvoicesService({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Customer,
          },
        ],
      });
    }

    return invoices;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const filterInvoiceById = async (id: number) => {
  // use zod to validate the input
  const schema = z.object({
    id: z.number(),
  });
  schema.parse({ id });
  try {
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

    return invoice;
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
  schema.parse({ id });
  try {
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

      // dispatch(getInvoicesSuccess((invoices)));
    });
    toast.success('Invoice deleted');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteInvoiceItemFn = ({
  productId,
  invoiceId,
  invoiceItemId,
  cb,
}: {
  productId: number;
  invoiceId: number;
  invoiceItemId: number;
  cb?: () => void;
}) => async () => {
  // use zod to validate the input
  const schema = z.object({
    productId: z.number(),
    invoiceId: z.number(),
    invoiceItemId: z.number(),
  });
  schema.parse({ productId, invoiceId, invoiceItemId });
  try {
    const invoice = await Invoice.findByPk(invoiceId);
    const invoiceItem = await InvoiceItem.findByPk(invoiceItemId);

    // transaction
    await sequelize.transaction(async (t) => {
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

export const addInvoiceItemFn = async ({
  invoiceId,
  productId,
  quantity,
  amount,
  unitPrice,
  profit,
}: IInvoiceItem) => {
  // use zod to validate the input
  const schema = z.object({
    invoiceId: z.number(),
    productId: z.number(),
    quantity: z.number(),
    amount: z.number(),
    unitPrice: z.number(),
    profit: z.number(),
  });
  schema.parse({ invoiceId, productId, quantity, amount, unitPrice, profit });
  try {
    const invoice = await Invoice.findByPk(invoiceId);
    const product = await Product.findByPk(productId);
    const customer = await Customer.findByPk(invoice.customerId);

    // if product is already in the invoice, delete it first and then add updated invoice item

    product.invoiceItem = {
      quantity,
      unitPrice,
      amount,
      profit,
    };

    // transaction
    await sequelize.transaction(async (t) => {
      const addProductToInvoice = invoice.addProduct(product, {
        transaction: t,
      });

      const decreaseStock = product.decrement(
        {
          stock: quantity,
        },
        { transaction: t }
      );

      const updateInvoice = invoice.increment(
        {
          amount,
          profit,
        },
        { transaction: t }
      );

      const updateCustomerBalance = async () => {
        if (invoice.saleType === 'credit' || invoice.saleType === 'transfer') {
          await customer.increment(
            {
              balance: amount,
            },
            { transaction: t }
          );
        }
      };

      await Promise.all([
        addProductToInvoice,
        decreaseStock,
        updateInvoice,
        updateCustomerBalance(),
      ]);
    });
  } catch (error) {
    toast.error(error.message || '');
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
        quantity: z.number(),
        unitPrice: z.number(),
        amount: z.number(),
        profit: z.number(),
      })
    ),
    invoice: z.object({
      customerId: z.number(),
      saleType: z.string(),
      amount: z.number(),
      profit: z.number(),
    }),
  });
  schema.parse({ invoiceItems, invoice });

  try {
    createInvoiceValidation(invoiceItems, invoice);
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    // transaction
    await sequelize.transaction(async (t) => {
      const customer = await Customer.findByPk(invoice?.customerId);

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
          const product = await Product.findByPk(item.product?.id);
          await Product.decrement('stock', {
            by: item.quantity,
            where: { id: item.id },
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
  schema.parse({ invoiceItems, invoice });

  try {
    await deleteInvoiceFn(invoice.id);
    await createInvoiceFn(invoiceItems, invoice, cb);
  } catch (error) {
    toast.error(error.message);
  }
};
