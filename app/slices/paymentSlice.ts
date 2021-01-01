import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import Payment from '../models/payment';
import Supplier from '../models/supplier';

const initialState = {
  singlePayment: {
    loading: false,
    data: '',
  },
  payments: {
    loading: false,
    data: '',
  },
  createPaymentState: {
    loading: false,
    data: '',
  },
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    getSinglePayment: (state) => {
      const { singlePayment } = state;
      singlePayment.loading = true;
    },
    getSinglePaymentSuccess: (state, { payload }) => {
      const { singlePayment } = state;
      singlePayment.loading = false;
      singlePayment.data = payload;
    },
    getSinglePaymentFailed: (state) => {
      const { singlePayment } = state;
      singlePayment.loading = false;
      singlePayment.data = '';
    },
    getPayments: (state) => {
      const { payments } = state;
      payments.loading = true;
    },
    getPaymentsSuccess: (state, { payload }) => {
      const { payments } = state;
      payments.loading = false;
      payments.data = payload;
    },
    getPaymentsFailed: (state) => {
      const { payments } = state;
      payments.loading = false;
      payments.data = '';
    },
    createPayment: (state) => {
      const { createPaymentState } = state;
      createPaymentState.loading = true;
      createPaymentState.data = '';
    },
    createPaymentSuccess: (state, { payload }) => {
      const { createPaymentState } = state;
      createPaymentState.loading = false;
      createPaymentState.data = payload;
    },
    createPaymentFailed: (state) => {
      const { createPaymentState } = state;
      createPaymentState.loading = false;
    },
  },
});

export const {
  getSinglePayment,
  getSinglePaymentSuccess,
  getSinglePaymentFailed,
  getPayments,
  getPaymentsSuccess,
  getPaymentsFailed,
  createPayment,
  createPaymentSuccess,
  createPaymentFailed,
} = paymentSlice.actions;

export const searchPaymentFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    const payments = await Payment.findAll({
      where: {
        id: {
          [Op.startsWith]: value,
        },
      },
    });
    dispatch(getPaymentsSuccess(JSON.stringify(payments)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updatePaymentFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
  try {
    // dispatch(updatePayment());
    await Payment.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updatePaymentSuccess(JSON.stringify(updatePaymentResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSinglePaymentFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSinglePayment());
    const getSinglePaymentResponse = await Payment.findByPk(id, {
      include: Supplier,
    });

    dispatch(getSinglePaymentSuccess(JSON.stringify(getSinglePaymentResponse)));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getPaymentsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getPayments());
    const payments = await Payment.findAll();
    dispatch(getPaymentsSuccess(JSON.stringify(payments)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createPaymentFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createPayment());
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    // const response = await Payment.create(values);
    await Payment.create({
      supplierId: values.supplierId || null,
      amount: values.amount || null,
      paymentType: values.paymentType || null,
      paymentMethod: values.paymentMethod || null,
      bank: values.bank || null,
      note: values.note || null,
      postedBy: user.id,
    });

    if (values.paymentType === 'debit') {
      await Supplier.decrement('balance', {
        by: values.amount,
        where: { id: values.supplierId },
      });
    } else if (values.paymentType === 'credit') {
      await Supplier.increment('balance', {
        by: values.amount,
        where: { id: values.supplierId },
      });
    }

    toast.success('Payment successfully created');

    cb();
    dispatch(createPaymentSuccess({}));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectPaymentState = (state: any) => state.payment;

export default paymentSlice.reducer;
