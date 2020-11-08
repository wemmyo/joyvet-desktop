import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import ProductModel from '../models/product';

const initialState = {
  products: {
    loading: false,
    data: '',
  },
  createProductState: {
    loading: false,
    data: '',
  },
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    getProducts: (state) => {
      const { products } = state;
      products.loading = true;
    },
    getProductsSuccess: (state, { payload }) => {
      const { products } = state;
      products.loading = false;
      products.data = payload;
    },
    getProductsFailed: (state) => {
      const { products } = state;
      products.loading = false;
    },
    createProduct: (state) => {
      const { createProductState } = state;
      createProductState.loading = true;
      createProductState.data = '';
    },
    createProductSuccess: (state, { payload }) => {
      const { createProductState } = state;
      createProductState.loading = false;
      createProductState.data = payload;
    },
    createProductFailed: (state) => {
      const { createProductState } = state;
      createProductState.loading = false;
    },
  },
});

export const {
  getProducts,
  getProductsSuccess,
  getProductsFailed,
  createProduct,
  createProductSuccess,
  createProductFailed,
} = productSlice.actions;

export const getProductsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getProducts());
    const products = await ProductModel.findAll();
    dispatch(getProductsSuccess(JSON.stringify(products)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createProductFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createProduct());
    // const response = await ProductModel.create(values);
    await ProductModel.create({
      title: values.title || null,
      stock: values.stock || null,
      unitPrice: values.unitPrice || null,
      productGroup: values.productGroup || null,
    });

    if (cb) {
      cb();
    }
    dispatch(createProductSuccess({}));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectProductState = (state: any) => state.product;

export default productSlice.reducer;
