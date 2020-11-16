import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import Product from '../models/product';

const initialState = {
  singleProduct: {
    loading: false,
    data: '',
  },
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
    getSingleProduct: (state) => {
      const { singleProduct } = state;
      singleProduct.loading = true;
    },
    getSingleProductSuccess: (state, { payload }) => {
      const { singleProduct } = state;
      singleProduct.loading = false;
      singleProduct.data = payload;
    },
    getSingleProductFailed: (state) => {
      const { singleProduct } = state;
      singleProduct.loading = false;
      singleProduct.data = '';
    },
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
  getSingleProduct,
  getSingleProductSuccess,
  getSingleProductFailed,
  getProducts,
  getProductsSuccess,
  getProductsFailed,
  createProduct,
  createProductSuccess,
  createProductFailed,
} = productSlice.actions;

export const updateProductFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    // dispatch(updateProduct());
    console.log(values, id);

    const response = await Product.update(values, {
      where: {
        id,
      },
    });
    console.log(response);

    // dispatch(updateProductSuccess(JSON.stringify(updateProductResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
export const getSingleProductFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSingleProduct());

    const getSingleProductResponse = await Product.findByPk(id);

    dispatch(getSingleProductSuccess(JSON.stringify(getSingleProductResponse)));
    if (cb) {
      cb();
    }
    console.log(getSingleProductResponse);
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getProductsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getProducts());
    const products = await Product.findAll();
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
    // const response = await Product.create(values);
    await Product.create({
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
