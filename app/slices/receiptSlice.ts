import { createSlice } from '@reduxjs/toolkit';
import ReceiptModel from '../models/receipt';
import { toast } from 'react-toastify';

const initialState = {
  receipts: {
    loading: true,
    data: [],
    error: {},
  },
  createReceiptState: {
    loading: false,
    data: {},
    error: {},
  },
};

const receiptSlice = createSlice({
  name: 'receipt',
  initialState: initialState,
  reducers: {
    getReceipts: (state) => {
      let { receipts } = state;
      receipts.loading = true;
      receipts.error = {};
    },
    getReceiptsSuccess: (state, { payload }) => {
      let { receipts } = state;
      receipts.loading = false;
      receipts.data = payload;
      receipts.error = {};
    },
    getReceiptsFailed: (state, { payload }) => {
      let { receipts } = state;
      receipts.loading = false;
      receipts.data = [];
      receipts.error = payload;
    },
    createReceipt: (state) => {
      let { createReceiptState } = state;
      createReceiptState.loading = true;
      createReceiptState.data = {};
      createReceiptState.error = {};
    },
    createReceiptSuccess: (state, { payload }) => {
      let { createReceiptState } = state;
      createReceiptState.loading = false;
      createReceiptState.data = payload;
      createReceiptState.error = {};
    },
    createReceiptFailed: (state, { payload }) => {
      let { createReceiptState } = state;
      createReceiptState.loading = false;
      createReceiptState.data = {};
      createReceiptState.error = payload;
    },
  },
});

export const {
  getReceipts,
  getReceiptsSuccess,
  getReceiptsFailed,
  createReceipt,
  createReceiptSuccess,
  createReceiptFailed,
} = receiptSlice.actions;

export const getReceiptsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getReceipts());
    const response = await ReceiptModel.findAll({
      raw: true,
    });
    console.log(response);
    dispatch(getReceiptsSuccess(response));
  } catch (error) {
    console.log(error);

    dispatch(getReceiptsFailed({}));
  }
};

export const createReceiptFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createReceipt());
    // const response = await ReceiptModel.create(values);
    const response = await ReceiptModel.create({
      amount: values.amount || null,
      note: values.note || null,
      customerId: values.customerId || null,
    });
    console.log(response);
    toast.success('Receipt successfully created');

    cb();
    dispatch(createReceiptSuccess({}));
  } catch (error) {
    dispatch(createReceiptFailed({}));
    console.log(error);
  }
};

export const selectReceiptState = (state: any) => state.receipt;

export default receiptSlice.reducer;
