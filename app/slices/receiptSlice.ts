import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import Receipt from '../models/receipt';
import Customer from '../models/customer';

const initialState = {
  singleReceipt: {
    loading: false,
    data: '',
  },
  receipts: {
    loading: true,
    data: '',
  },
  createReceiptState: {
    loading: false,
    data: '',
  },
};

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    getSingleReceipt: (state) => {
      const { singleReceipt } = state;
      singleReceipt.loading = true;
    },
    getSingleReceiptSuccess: (state, { payload }) => {
      const { singleReceipt } = state;
      singleReceipt.loading = false;
      singleReceipt.data = payload;
    },
    getSingleReceiptFailed: (state) => {
      const { singleReceipt } = state;
      singleReceipt.loading = false;
      singleReceipt.data = '';
    },
    getReceipts: (state) => {
      const { receipts } = state;
      receipts.loading = true;
    },
    getReceiptsSuccess: (state, { payload }) => {
      const { receipts } = state;
      receipts.loading = false;
      receipts.data = payload;
    },
    getReceiptsFailed: (state) => {
      const { receipts } = state;
      receipts.loading = false;
      receipts.data = '';
    },
    createReceipt: (state) => {
      const { createReceiptState } = state;
      createReceiptState.loading = true;
      createReceiptState.data = '';
    },
    createReceiptSuccess: (state, { payload }) => {
      const { createReceiptState } = state;
      createReceiptState.loading = false;
      createReceiptState.data = payload;
    },
    createReceiptFailed: (state) => {
      const { createReceiptState } = state;
      createReceiptState.loading = false;
      createReceiptState.data = '';
    },
  },
});

export const {
  getSingleReceipt,
  getSingleReceiptSuccess,
  getSingleReceiptFailed,
  getReceipts,
  getReceiptsSuccess,
  getReceiptsFailed,
  createReceipt,
  createReceiptSuccess,
  createReceiptFailed,
} = receiptSlice.actions;

export const updateReceiptFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    // dispatch(updateReceipt());
    await Receipt.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updateReceiptSuccess(JSON.stringify(updateReceiptResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleReceiptFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSingleReceipt());
    const getSingleReceiptResponse = await Receipt.findByPk(id, {
      include: Customer,
    });

    dispatch(getSingleReceiptSuccess(JSON.stringify(getSingleReceiptResponse)));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getReceiptsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getReceipts());
    const receipts = await Receipt.findAll();
    dispatch(getReceiptsSuccess(JSON.stringify(receipts)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createReceiptFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createReceipt());
    // const response = await Receipt.create(values);
    await Receipt.create({
      amount: values.amount || null,
      note: values.note || null,
      customerId: values.customerId || null,
    });

    await Customer.decrement('balance', {
      by: values.amount,
      where: { id: values.customerId },
    });

    dispatch(createReceiptSuccess({}));
    toast.success('Receipt successfully created');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectReceiptState = (state: any) => state.receipt;

export default receiptSlice.reducer;
