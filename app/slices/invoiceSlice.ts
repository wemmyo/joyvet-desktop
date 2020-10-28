import { createSlice } from '@reduxjs/toolkit';
import InvoiceModel from '../models/invoice';
import { toast } from 'react-toastify';
import Customer from '../models/customer';
import Product from '../models/product';
import InvoiceItem from '../models/invoiceItem';

const initialState = {
  invoices: {
    loading: true,
    data: [],
    error: {},
  },
  createInvoiceState: {
    loading: false,
    data: {},
    error: {},
  },
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState: initialState,
  reducers: {
    getInvoices: (state) => {
      let { invoices } = state;
      invoices.loading = true;
      invoices.error = {};
    },
    getInvoicesSuccess: (state, { payload }) => {
      let { invoices } = state;
      invoices.loading = false;
      invoices.data = payload;
      invoices.error = {};
    },
    getInvoicesFailed: (state, { payload }) => {
      let { invoices } = state;
      invoices.loading = false;
      invoices.data = [];
      invoices.error = payload;
    },
    createInvoice: (state) => {
      let { createInvoiceState } = state;
      createInvoiceState.loading = true;
      createInvoiceState.data = {};
      createInvoiceState.error = {};
    },
    createInvoiceSuccess: (state, { payload }) => {
      let { createInvoiceState } = state;
      createInvoiceState.loading = false;
      createInvoiceState.data = payload;
      createInvoiceState.error = {};
    },
    createInvoiceFailed: (state, { payload }) => {
      let { createInvoiceState } = state;
      createInvoiceState.loading = false;
      createInvoiceState.data = {};
      createInvoiceState.error = payload;
    },
  },
});

export const {
  getInvoices,
  getInvoicesSuccess,
  getInvoicesFailed,
  createInvoice,
  createInvoiceSuccess,
  createInvoiceFailed,
} = invoiceSlice.actions;

export const getInvoicesFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getInvoices());
    const response = await InvoiceModel.findAll({
      raw: true,
    });
    // console.log((await InvoiceModel.findAll()).toJSON());
    console.log(response);
    dispatch(getInvoicesSuccess(response));
  } catch (error) {
    console.log(error);

    dispatch(getInvoicesFailed({}));
  }
};

export const createInvoiceFn = (
  values: any,
  meta?: any,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(createInvoice());
    const customer = await Customer.findByPk(meta.customerId);
    const invoice = await customer.createInvoice();
    const prodArr: any = [];
    await Promise.all(
      values.map(async (each: any) => {
        const prod = await Product.findByPk(each.id);
        prod.invoiceItem = { quantity: each.quantity };
        prodArr.push(prod);
      })
    );
    await invoice.addProducts(prodArr);
    // cb();
    dispatch(createInvoiceSuccess({}));
  } catch (error) {
    dispatch(createInvoiceFailed({}));
    console.log(error);
  }
};

export const selectInvoiceState = (state: any) => state.invoice;

export default invoiceSlice.reducer;
