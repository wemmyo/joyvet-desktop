import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
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

export const searchReceiptFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    const receipts = await Receipt.findAll({
      where: {
        id: {
          [Op.startsWith]: value,
        },
      },
      include: [
        {
          model: Customer,
        },
      ],
    });
    dispatch(getReceiptsSuccess(JSON.stringify(receipts)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateReceiptFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
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
    const receipts = await Receipt.findAll({
      include: [
        {
          model: Customer,
        },
      ],
    });
    dispatch(getReceiptsSuccess(JSON.stringify(receipts)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteReceiptFn = (id: string | number, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    const receipt = await Receipt.findByPk(id);
    const customer = await Customer.findByPk(receipt.customerId);

    // update customers balance
    const updateBalance = await customer.increment({
      balance: receipt.amount,
    });

    const deleteReceipt = await receipt.destroy();

    await Promise.all([updateBalance, deleteReceipt]);

    cb();
    toast.success('Receipt successfully deleted');
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
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await Receipt.create({
      customerId: values.customerId || null,
      amount: values.amount || null,
      paymentMethod: values.paymentMethod || null,
      bank: values.bank || null,
      note: values.note || null,
      postedBy: user.fullName,
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
