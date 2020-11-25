import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import Purchase from '../models/purchase';
import Supplier from '../models/supplier';
import Product from '../models/product';

const initialState = {
  singlePurchase: {
    loading: false,
    data: '',
  },
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
    getSinglePurchase: (state) => {
      const { singlePurchase } = state;
      singlePurchase.loading = true;
    },
    getSinglePurchaseSuccess: (state, { payload }) => {
      const { singlePurchase } = state;
      singlePurchase.loading = false;
      singlePurchase.data = payload;
    },
    getSinglePurchaseFailed: (state) => {
      const { singlePurchase } = state;
      singlePurchase.loading = false;
      singlePurchase.data = '';
    },
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
  getSinglePurchase,
  getSinglePurchaseSuccess,
  getSinglePurchaseFailed,
  getPurchases,
  getPurchasesSuccess,
  getPurchasesFailed,
  createPurchase,
  createPurchaseSuccess,
  createPurchaseFailed,
} = purchaseSlice.actions;

export const getSinglePurchaseFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSinglePurchase());

    const getSinglePurchaseResponse = await Purchase.findByPk(id, {
      include: [
        { model: Supplier },
        {
          model: Product,
        },
      ],
    });

    dispatch(
      getSinglePurchaseSuccess(JSON.stringify(getSinglePurchaseResponse))
    );
    if (cb) {
      cb();
    }
    console.log(getSinglePurchaseResponse);
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getPurchasesFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getPurchases());
    const purchases = await Purchase.findAll();
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
