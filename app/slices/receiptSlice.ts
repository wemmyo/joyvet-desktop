import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import Receipt from '../models/receipt';
import Customer from '../models/customer';
import sequelize from '../utils/database';

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
    await sequelize.transaction(async (t) => {
      const receipt = await Receipt.findByPk(id);

      // update customers balance
      const updateBalance = await Customer.increment('balance', {
        by: receipt.amount,
        where: {
          id: receipt.customerId,
        },
        transaction: t,
      });

      const deleteReceipt = await receipt.destroy({ transaction: t });

      await Promise.all([updateBalance, deleteReceipt]);

      cb();
      toast.success('Receipt successfully deleted');
    });
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createReceiptFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    await sequelize.transaction(async (t) => {
      dispatch(createReceipt());
      const user =
        localStorage.getItem('user') !== null
          ? JSON.parse(localStorage.getItem('user') || '')
          : '';
      await Receipt.create(
        {
          customerId: values.customerId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      await Customer.decrement('balance', {
        by: values.amount,
        where: { id: values.customerId },
        transaction: t,
      });
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
