import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import PurchaseModel from '../models/purchase';
import Supplier from '../models/supplier';
import Product from '../models/product';

const initialState = {
  purchases: {
    loading: false,
    data: '',
  },
  createPurchaseState: {
    loading: false,
    data: '',
  },
};

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    getPurchases: (state) => {
      const { purchases } = state;
      purchases.loading = true;
    },
    getPurchasesSuccess: (state, { payload }) => {
      const { purchases } = state;
      purchases.loading = false;
      purchases.data = payload;
    },
    getPurchasesFailed: (state) => {
      const { purchases } = state;
      purchases.loading = false;
      purchases.data = '';
    },
    createPurchase: (state) => {
      const { createPurchaseState } = state;
      createPurchaseState.loading = true;
      createPurchaseState.data = '';
    },
    createPurchaseSuccess: (state, { payload }) => {
      const { createPurchaseState } = state;
      createPurchaseState.loading = false;
      createPurchaseState.data = payload;
    },
    createPurchaseFailed: (state) => {
      const { createPurchaseState } = state;
      createPurchaseState.loading = false;
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
    const purchases = await PurchaseModel.findAll();
    dispatch(getPurchasesSuccess(JSON.stringify(purchases)));
  } catch (error) {
    toast.error(error.message || '');
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
    toast.error(error.message || '');
  }
};

export const selectPurchaseState = (state: any) => state.purchase;

export default purchaseSlice.reducer;
