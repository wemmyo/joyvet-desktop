import { createSlice } from '@reduxjs/toolkit';
import ProductModel from '../models/product';
import { toast } from 'react-toastify';

const initialState = {
  products: {
    loading: true,
    data: [],
    error: {},
  },
  createProductState: {
    loading: false,
    data: {},
    error: {},
  },
};

const productSlice = createSlice({
  name: 'product',
  initialState: initialState,
  reducers: {
    getProducts: (state) => {
      let { products } = state;
      products.loading = true;
      products.error = {};
    },
    getProductsSuccess: (state, { payload }) => {
      let { products } = state;
      products.loading = false;
      products.data = payload;
      products.error = {};
    },
    getProductsFailed: (state, { payload }) => {
      let { products } = state;
      products.loading = false;
      products.data = [];
      products.error = payload;
    },
    createProduct: (state) => {
      let { createProductState } = state;
      createProductState.loading = true;
      createProductState.data = {};
      createProductState.error = {};
    },
    createProductSuccess: (state, { payload }) => {
      let { createProductState } = state;
      createProductState.loading = false;
      createProductState.data = payload;
      createProductState.error = {};
    },
    createProductFailed: (state, { payload }) => {
      let { createProductState } = state;
      createProductState.loading = false;
      createProductState.data = {};
      createProductState.error = payload;
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
    const response = await ProductModel.findAll({
      raw: true,
    });
    console.log(response);
    dispatch(getProductsSuccess(response));
  } catch (error) {
    console.log(error);

    dispatch(getProductsFailed({}));
  }
};

export const createProductFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createProduct());
    // const response = await ProductModel.create(values);
    const response = await ProductModel.create({
      title: values.title || null,
      stock: values.stock || null,
      price: values.price || null,
    });
    console.log(response);
    toast.success('Product successfully created');

    cb();
    dispatch(createProductSuccess({}));
  } catch (error) {
    dispatch(createProductFailed({}));
    console.log(error);
  }
};

export const selectProductState = (state: any) => state.product;

export default productSlice.reducer;
