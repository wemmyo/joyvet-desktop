import { createSlice } from '@reduxjs/toolkit';
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
import type { RootState } from '../store';
import {
  getInvoices as getInvoicesService,
  getInvoiceById,
  createInvoice as createInvoiceService,
  updateInvoice as updateInvoiceService,
  deleteInvoice as deleteInvoiceService,
} from '../services/invoice.service';

interface IState {
  singleInvoice: {
    loading: boolean;
    data: IInvoice;
  };
  invoices: {
    loading: boolean;
    data: IInvoice[];
  };
  createInvoice: {
    loading: boolean;
    data: IInvoice;
  };
}

const initialState: IState = {
  singleInvoice: {
    loading: false,
    data: {} as IInvoice,
  },
  invoices: {
    loading: false,
    data: [],
  },
  createInvoice: {
    loading: false,
    data: {} as IInvoice,
  },
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    getSingleInvoice: (state) => {
      const { singleInvoice } = state;
      singleInvoice.loading = true;
    },
    getSingleInvoiceSuccess: (state, { payload }) => {
      const { singleInvoice } = state;
      singleInvoice.loading = false;
      singleInvoice.data = payload;
    },
    getSingleInvoiceFailed: (state) => {
      const { singleInvoice } = state;
      singleInvoice.loading = false;
      singleInvoice.data = {} as IInvoice;
    },

    filterByType: (state, { payload }) => {
      const { invoices } = state;
      const parsedInvoice = invoices.data;
      const filteredInvoice = parsedInvoice.filter(
        (invoice) => invoice.saleType === payload
      );
      invoices.data = filteredInvoice;
    },
    getInvoices: (state) => {
      const { invoices } = state;
      invoices.loading = true;
    },
    getInvoicesSuccess: (state, { payload }) => {
      const { invoices } = state;
      invoices.loading = false;
      invoices.data = payload;
    },
    getInvoicesFailed: (state) => {
      const { invoices } = state;
      invoices.loading = false;
      invoices.data = [];
    },
    createInvoice: (state) => {
      const { createInvoice } = state;
      createInvoice.loading = true;
      createInvoice.data = {} as IInvoice;
    },
    createInvoiceSuccess: (state, { payload }) => {
      const { createInvoice } = state;
      createInvoice.loading = false;
      createInvoice.data = payload;
    },
    createInvoiceFailed: (state) => {
      const { createInvoice } = state;
      createInvoice.loading = false;
      createInvoice.data = {} as IInvoice;
    },
    clearCreateInvoice: (state) => {
      const { createInvoice } = state;
      createInvoice.loading = false;
      createInvoice.data = {} as IInvoice;
    },
  },
});

export const {
  getSingleInvoice,
  getSingleInvoiceSuccess,
  getSingleInvoiceFailed,
  getInvoices,
  getInvoicesSuccess,
  getInvoicesFailed,
  createInvoice,
  createInvoiceSuccess,
  createInvoiceFailed,
  filterByType,
  clearCreateInvoice,
} = invoiceSlice.actions;

export const filterInvoiceFn = (
  startDate: string,
  endDate: string,
  saleType: string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate the input
  const schema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    saleType: z.string(),
  });
  schema.parse({ startDate, endDate, saleType });

  try {
    dispatch(getInvoices());
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

    dispatch(getInvoicesSuccess(invoices));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const filterInvoiceById = (id: number) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate the input
  const schema = z.object({
    id: z.number(),
  });
  schema.parse({ id });
  try {
    dispatch(getInvoices());

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

    dispatch(getInvoicesSuccess(invoices));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleInvoiceFn = (id: number, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    // use zod to validate the input
    const schema = z.object({
      id: z.number(),
    });
    schema.parse({ id });
    dispatch(getSingleInvoice());

    const invoice = getInvoiceById(id, {
      include: [
        { model: Customer },
        {
          model: Product,
        },
      ],
    });

    dispatch(getSingleInvoiceSuccess(invoice));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const clearCreateInvoiceFn = () => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  dispatch(clearCreateInvoice());
};

export const getInvoicesFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getInvoices());

    const invoices = await getInvoicesService({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Customer,
        },
      ],
    });

    dispatch(getInvoicesSuccess(invoices));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteInvoiceFn = (id: number, cb?: () => void) => async () => {
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

export const addInvoiceItemFn = ({
  invoiceId,
  productId,
  quantity,
  amount,
  unitPrice,
  profit,
  cb,
}: {
  invoiceId: number;
  productId: number;
  quantity: number;
  amount: number;
  unitPrice: number;
  profit: number;
  cb: () => void;
}) => async () => {
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
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createInvoiceFn = (
  values: Partial<IInvoiceItem>[],
  meta?: Partial<IInvoice>,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    createInvoiceValidation(values, meta);
    dispatch(createInvoice());
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    // transaction
    await sequelize.transaction(async (t) => {
      const customer = await Customer.findByPk(meta?.customerId);

      const invoice = await customer.createInvoice(
        {
          saleType: meta?.saleType,
          amount: meta?.amount,
          profit: meta?.profit,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      const prodArr: IInvoiceItem[] = [];

      await Promise.all(
        values.map(async (each) => {
          const prod = await Product.findByPk(each.id);
          await Product.decrement('stock', {
            by: each.quantity,
            where: { id: each.id },
            transaction: t,
          });
          prod.invoiceItem = {
            quantity: each.quantity,
            unitPrice: each.unitPrice,
            amount: each.amount,
            profit: each.profit,
          };
          prodArr.push(prod);
        })
      );
      await invoice.addProducts(prodArr, { transaction: t });
      if (meta?.saleType === 'credit' || meta?.saleType === 'transfer') {
        await Customer.increment('balance', {
          by: meta.amount,
          where: { id: meta.customerId },
          transaction: t,
        });
      }
      dispatch(createInvoiceSuccess(invoice));
    });
    toast.success('Invoice created');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message);
  }
};

export const selectInvoiceState = (state: RootState) => state.invoice;

export default invoiceSlice.reducer;
