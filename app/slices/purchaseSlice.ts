import { createSlice } from '@reduxjs/toolkit';
import PurchaseModel from '../models/purchase';
// import { toast } from 'react-toastify';
import Supplier from '../models/supplier';
import Product from '../models/product';

const initialState = {
  purchases: {
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
  name: 'purchases',
  initialState: initialState,
  reducers: {
    getPurchases: (state) => {
      let { purchases } = state;
      purchases.loading = true;
      purchases.error = {};
    },
    getPurchasesSuccess: (state, { payload }) => {
      let { purchases } = state;
      purchases.loading = false;
      purchases.data = payload;
      purchases.error = {};
    },
    getPurchasesFailed: (state, { payload }) => {
      let { purchases } = state;
      purchases.loading = false;
      purchases.data = [];
      purchases.error = payload;
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

export const createPurchaseFn = (
  values: any,
  meta?: any,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(createPurchase());
    const supplier = await Supplier.findByPk(meta.supplierId);
    const purchase = await supplier.createPurchase({
      invoiceNumber: meta.invoiceNumber,
      invoiceDate: meta.invoiceDate,
      amount: meta.amount,
    });
    const prodArr: any = [];
    await Promise.all(
      values.map(async (each: any) => {
        const prod = await Product.findByPk(each.id);
        await Product.increment('stock', {
          by: each.quantity,
          where: { id: each.id },
        });
        prod.purchaseItem = { quantity: each.quantity };
        prodArr.push(prod);
      })
    );
    await purchase.addProducts(prodArr);
    if (cb) {
      cb();
    }
    dispatch(createPurchaseSuccess({}));
  } catch (error) {
    dispatch(createPurchaseFailed({}));
    console.log(error);
  }
};

export const selectPurchaseState = (state: any) => state.purchase;

export default purchaseSlice.reducer;
