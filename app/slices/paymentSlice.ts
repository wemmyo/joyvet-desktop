import { createSlice } from '@reduxjs/toolkit';
import PaymentModel from '../models/payment';
import { toast } from 'react-toastify';

const initialState = {
  payments: {
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
      let { payments } = state;
      payments.loading = true;
      payments.error = {};
    },
    getPaymentsSuccess: (state, { payload }) => {
      let { payments } = state;
      payments.loading = false;
      payments.data = payload;
      payments.error = {};
    },
    getPaymentsFailed: (state, { payload }) => {
      let { payments } = state;
      payments.loading = false;
      payments.data = [];
      payments.error = payload;
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
      amount: values.amount || null,
      note: values.note || null,
      customerId: values.customerId || null,
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
