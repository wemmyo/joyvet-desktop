import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import Invoice from '../models/invoice';
import Customer from '../models/customer';
import Product from '../models/product';
import User from '../models/user';

const initialState = {
  singleInvoice: {
    loading: false,
    data: '',
  },
  invoices: {
    loading: false,
    data: '',
  },
  createInvoiceState: {
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
      const { createInvoiceState } = state;
      createInvoiceState.loading = true;
      createInvoiceState.data = '';
    },
    createInvoiceSuccess: (state, { payload }) => {
      const { createInvoiceState } = state;
      createInvoiceState.loading = false;
      createInvoiceState.data = payload;
    },
    createInvoiceFailed: (state) => {
      const { createInvoiceState } = state;
      createInvoiceState.loading = false;
      createInvoiceState.data = '';
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
} = invoiceSlice.actions;

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
        {
          model: User,
        },
        // 'postedBy',
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

export const getInvoicesFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getInvoices());
    const invoices = await Invoice.findAll();

    dispatch(getInvoicesSuccess(JSON.stringify(invoices)));
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
      postedBy: user.id,
    });

    const prodArr: any = [];

    await Promise.all(
      values.map(async (each: any) => {
        const prod = await Product.findByPk(each.id);
        if (prod.stock < each.quantity) {
          throw new Error(`${prod.title} is out of stock`);
        }
        await Product.decrement('stock', {
          by: each.quantity,
          where: { id: each.id },
        });
        prod.invoiceItem = { quantity: each.quantity };
        prodArr.push(prod);
      })
    );
    const createdInvoice = await invoice.addProducts(prodArr);
    // console.log(createdInvoice);

    // await Captain.bulkCreate([
    //   { name: 'Jack Sparrow' },
    //   { name: 'Davy Jones' }
    // ], { updateOnDuplicate: ["name"] });
    toast.success('Invoice created');
    if (cb) {
      cb();
    }
    dispatch(createInvoiceSuccess(JSON.stringify(createdInvoice)));
  } catch (error) {
    toast.error(error.message);
  }
};

export const selectInvoiceState = (state: any) => state.invoice;

export default invoiceSlice.reducer;
