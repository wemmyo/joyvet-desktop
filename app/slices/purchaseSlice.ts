import { createSlice } from '@reduxjs/toolkit';
import PurchaseModel from '../models/purchase';
import { toast } from 'react-toastify';

const initialState = {
  purchase: {
    loading: true,
    data: [],
    error: {},
  },
  createPurchaseState: {
    loading: false,
    data: {},
    error: {},
  },
};

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState: initialState,
  reducers: {
    getPurchases: (state) => {
      let { purchase } = state;
      purchase.loading = true;
      purchase.error = {};
    },
    getPurchasesSuccess: (state, { payload }) => {
      let { purchase } = state;
      purchase.loading = false;
      purchase.data = payload;
      purchase.error = {};
    },
    getPurchasesFailed: (state, { payload }) => {
      let { purchase } = state;
      purchase.loading = false;
      purchase.data = [];
      purchase.error = payload;
    },
    createPurchase: (state) => {
      let { createPurchaseState } = state;
      createPurchaseState.loading = true;
      createPurchaseState.data = {};
      createPurchaseState.error = {};
    },
    createPurchaseSuccess: (state, { payload }) => {
      let { createPurchaseState } = state;
      createPurchaseState.loading = false;
      createPurchaseState.data = payload;
      createPurchaseState.error = {};
    },
    createPurchaseFailed: (state, { payload }) => {
      let { createPurchaseState } = state;
      createPurchaseState.loading = false;
      createPurchaseState.data = {};
      createPurchaseState.error = payload;
    },
  },
});

export const {
  getPurchases,
  getPurchasesSuccess,
  getPurchasesFailed,
  createPurchase,
  createPurchaseSuccess,
  createPurchaseFailed,
} = purchaseSlice.actions;

export const getPurchasesFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getPurchases());
    const response = await PurchaseModel.findAll({
      raw: true,
    });
    console.log(response);
    dispatch(getPurchasesSuccess(response));
  } catch (error) {
    console.log(error);

    dispatch(getPurchasesFailed({}));
  }
};

export const createPurchaseFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createPurchase());
    // const response = await PurchaseModel.create(values);
    const response = await PurchaseModel.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || null,
    });
    console.log(response);
    toast.success('Purchase successfully created');

    cb();
    dispatch(createPurchaseSuccess({}));
  } catch (error) {
    dispatch(createPurchaseFailed({}));
    console.log(error);
  }
};

export const selectPurchaseState = (state: any) => state.purchase;

export default purchaseSlice.reducer;
