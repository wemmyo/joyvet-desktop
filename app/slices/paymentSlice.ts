import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import PaymentModel from '../models/payment';
import SupplierModel from '../models/supplier';

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

export const getSinglePaymentFn = (
  id: string | number,
  cb: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSinglePayment());
    const getSinglePaymentResponse = await PaymentModel.findByPk(id, {
      include: SupplierModel,
    });

    dispatch(getSinglePaymentSuccess(JSON.stringify(getSinglePaymentResponse)));
    cb();
  } catch (error) {
    toast.error(error.message || '');
  }
};
export const getPaymentsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getPayments());
    const payments = await PaymentModel.findAll();
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
    // const response = await PaymentModel.create(values);
    await PaymentModel.create({
      amount: values.amount || null,
      note: values.note || null,
      supplierId: values.supplierId || null,
    });

    await SupplierModel.decrement('balance', {
      by: values.amount,
      where: { id: values.supplierId },
    });
    toast.success('Payment successfully created');

    cb();
    dispatch(createPaymentSuccess({}));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectPaymentState = (state: any) => state.payment;

export default paymentSlice.reducer;
