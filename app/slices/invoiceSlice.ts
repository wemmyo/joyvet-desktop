import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import Invoice from '../models/invoice';
import Customer from '../models/customer';
import Product from '../models/product';
import InvoiceItem from '../models/invoiceItem';

const initialState = {
  singleInvoice: {
    loading: false,
    data: '',
  },
  invoices: {
    loading: false,
    data: '',
  },
  createInvoice: {
    loading: false,
    data: '',
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
      singleInvoice.data = '';
    },
    clearCreateInvoice: (state) => {
      const { createInvoice } = state;
      createInvoice.loading = false;
      createInvoice.data = '';
    },
    filterByType: (state, { payload }) => {
      const { invoices } = state;
      const parsedInvoice = JSON.parse(invoices.data);
      const filteredInvoice = parsedInvoice.filter(
        (invoice: any) => invoice.saleType === payload
      );
      invoices.data = JSON.stringify(filteredInvoice);
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
      invoices.data = '';
    },
    createInvoice: (state) => {
      const { createInvoice } = state;
      createInvoice.loading = true;
      createInvoice.data = '';
    },
    createInvoiceSuccess: (state, { payload }) => {
      const { createInvoice } = state;
      createInvoice.loading = false;
      createInvoice.data = payload;
    },
    createInvoiceFailed: (state) => {
      const { createInvoice } = state;
      createInvoice.loading = false;
      createInvoice.data = '';
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
  startDate: Date | string,
  endDate: Date | string,
  saleType: string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getInvoices());
    let invoices;

    if (startDate && endDate && saleType === 'all') {
      // console.log('RAN FUNCTION 1');

      invoices = await Invoice.findAll({
        where: {
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 00:00:00`,
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

      invoices = await Invoice.findAll({
        where: {
          saleType,
          createdAt: {
            [Op.between]: [
              `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
              `${moment(endDate).format('YYYY-MM-DD')} 00:00:00`,
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

      invoices = await Invoice.findAll({
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

      invoices = await Invoice.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Customer,
          },
        ],
      });
    }

    dispatch(getInvoicesSuccess(JSON.stringify(invoices)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const filterInvoiceById = (id: string | number) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getInvoices());
    const invoices = await Invoice.findAll({
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

    dispatch(getInvoicesSuccess(JSON.stringify(invoices)));
  } catch (error) {
    toast.error(error.message || '');
  }
};
export const deleteInvoiceFn = (id: string | number, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    // dispatch(getInvoices());
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
        });
      })
    );
    invoice.destroy();

    toast.success('Invoice deleted');

    // dispatch(getInvoicesSuccess(JSON.stringify(invoices)));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleInvoiceFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSingleInvoice());

    const getSingleInvoiceResponse = await Invoice.findByPk(id, {
      // include: { all: true, nested: true },
      include: [
        { model: Customer },
        {
          model: Product,
        },
      ],
    });

    dispatch(getSingleInvoiceSuccess(JSON.stringify(getSingleInvoiceResponse)));
    if (cb) {
      cb();
    }
    console.log(getSingleInvoiceResponse);
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
    const invoices = await Invoice.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Customer,
        },
      ],
    });

    dispatch(getInvoicesSuccess(JSON.stringify(invoices)));
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
  productId: string | number;
  invoiceId: string | number;
  invoiceItemId: string | number;
  cb?: () => void;
}) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    const product = await Product.findByPk(productId);
    const invoice = await Invoice.findByPk(invoiceId);
    const invoiceItem = await InvoiceItem.findByPk(invoiceItemId);

    // update stock
    product.increment({
      stock: invoiceItem.quantity,
    });

    // update total amount
    // update total profit
    invoice.decrement({
      amount: invoiceItem.amount,
      profit: invoiceItem.profit,
    });

    await invoiceItem.destroy();

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
  invoiceId: string | number;
  productId: string | number;
  quantity: number;
  amount: number;
  unitPrice: number;
  profit: number;
  cb: () => void;
}) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    const invoice = await Invoice.findByPk(invoiceId);
    const product = await Product.findByPk(productId);

    product.invoiceItem = {
      quantity,
      unitPrice,
      amount,
      profit,
    };

    await invoice.addProduct(product);

    await product.decrement({
      stock: quantity,
    });

    invoice.increment({
      amount,
      profit,
    });

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createInvoiceFn = (
  values: any,
  meta?: any,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(createInvoice());
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    const customer = await Customer.findByPk(meta.customerId);

    const invoice = await customer.createInvoice({
      saleType: meta.saleType,
      amount: meta.amount,
      profit: meta.profit,
      postedBy: user.fullName,
    });

    const prodArr: any = [];

    await Promise.all(
      values.map(async (each: any) => {
        const prod = await Product.findByPk(each.id);
        await Product.decrement('stock', {
          by: each.quantity,
          where: { id: each.id },
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
    await invoice.addProducts(prodArr);
    if (meta.saleType === 'credit') {
      await Customer.increment('balance', {
        by: meta.amount,
        where: { id: meta.customerId },
      });
    }

    toast.success('Invoice created');
    dispatch(createInvoiceSuccess(JSON.stringify(invoice)));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message);
  }
};

export const selectInvoiceState = (state: any) => state.invoice;

export default invoiceSlice.reducer;
