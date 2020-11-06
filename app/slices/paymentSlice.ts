import { createSlice } from '@reduxjs/toolkit';
import PaymentModel from '../models/payment';
import SupplierModel from '../models/supplier';
import { toast } from 'react-toastify';

const initialState = {
  singlePayment: {
    loading: true,
    data: '',
    error: {},
  },
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
    getSinglePayment: (state) => {
      let { singlePayment } = state;
      singlePayment.loading = true;
      singlePayment.error = {};
    },
    getSinglePaymentSuccess: (state, { payload }) => {
      let { singlePayment } = state;
      singlePayment.loading = false;
      singlePayment.data = payload;
      singlePayment.error = {};
    },
    getSinglePaymentFailed: (state, { payload }) => {
      let { singlePayment } = state;
      singlePayment.loading = false;
      singlePayment.data = '';
      singlePayment.error = payload;
    },
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
    const response = await PaymentModel.findByPk(id, {
      include: SupplierModel,
    });
    // console.log(JSON.stringify(response));

    dispatch(getSinglePaymentSuccess(JSON.stringify(response)));
    cb();
    // dispatch(getSinglePaymentSuccess(JSON.stringify(response)));
  } catch (error) {
    console.log(error);

    dispatch(getSinglePaymentFailed({}));
  }
};
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
      supplierId: values.supplierId || null,
    });
    console.log(response);
    // const supplier = await SupplierModel.findByPk(values.supplierId);
    await SupplierModel.decrement('balance', {
      by: values.amount,
      where: { id: values.supplierId },
    });

    // if(supplier.balance)

    // await SupplierModel.decrement('balance', {
    //   by: each.quantity,
    //   where: { id: each.id },
    // });

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
