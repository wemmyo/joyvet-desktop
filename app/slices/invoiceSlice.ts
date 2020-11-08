import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import InvoiceModel from '../models/invoice';
import Customer from '../models/customer';
import Product from '../models/product';

const initialState = {
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
    const invoices = await InvoiceModel.findAll();

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
    const customer = await Customer.findByPk(meta.customerId);
    const invoice = await customer.createInvoice({
      saleType: meta.saleType,
      amount: meta.amount,
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
    await invoice.addProducts(prodArr);
    // await Captain.bulkCreate([
    //   { name: 'Jack Sparrow' },
    //   { name: 'Davy Jones' }
    // ], { updateOnDuplicate: ["name"] });

    if (cb) {
      cb();
    }
    dispatch(createInvoiceSuccess({}));
  } catch (error) {
    toast.error(error.message);
  }
};

export const selectInvoiceState = (state: any) => state.invoice;

export default invoiceSlice.reducer;
