import { createSlice } from '@reduxjs/toolkit';
import PaymentModel from '../models/payment';
import { toast } from 'react-toastify';

const initialState = {
  payment: {
    loading: true,
    data: [],
    error: {},
  },
  createPaymentState: {
    loading: false,
    data: {},
    error: {},
  },
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState: initialState,
  reducers: {
    getPayments: (state) => {
      let { payment } = state;
      payment.loading = true;
      payment.error = {};
    },
    getPaymentsSuccess: (state, { payload }) => {
      let { payment } = state;
      payment.loading = false;
      payment.data = payload;
      payment.error = {};
    },
    getPaymentsFailed: (state, { payload }) => {
      let { payment } = state;
      payment.loading = false;
      payment.data = [];
      payment.error = payload;
    },
    createPayment: (state) => {
      let { createPaymentState } = state;
      createPaymentState.loading = true;
      createPaymentState.data = {};
      createPaymentState.error = {};
    },
    createPaymentSuccess: (state, { payload }) => {
      let { createPaymentState } = state;
      createPaymentState.loading = false;
      createPaymentState.data = payload;
      createPaymentState.error = {};
    },
    createPaymentFailed: (state, { payload }) => {
      let { createPaymentState } = state;
      createPaymentState.loading = false;
      createPaymentState.data = {};
      createPaymentState.error = payload;
    },
  },
});

export const {
  getPayments,
  getPaymentsSuccess,
  getPaymentsFailed,
  createPayment,
  createPaymentSuccess,
  createPaymentFailed,
} = paymentSlice.actions;

export const getPaymentsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getPayments());
    const response = await PaymentModel.findAll({
      raw: true,
    });
    console.log(response);
    dispatch(getPaymentsSuccess(response));
  } catch (error) {
    console.log(error);

    dispatch(getPaymentsFailed({}));
  }
};

export const createPaymentFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createPayment());
    // const response = await PaymentModel.create(values);
    const response = await PaymentModel.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || null,
    });
    console.log(response);
    toast.success('Payment successfully created');

    cb();
    dispatch(createPaymentSuccess({}));
  } catch (error) {
    dispatch(createPaymentFailed({}));
    console.log(error);
  }
};

export const selectPaymentState = (state: any) => state.payment;

export default paymentSlice.reducer;
