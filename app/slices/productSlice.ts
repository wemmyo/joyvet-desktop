import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
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

export const searchProductFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    const products = await Product.findAll({
      where: {
        title: {
          [Op.substring]: value,
        },
      },
    });
    dispatch(getProductsSuccess(JSON.stringify(products)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateProductFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
  try {
    // dispatch(updateProduct());
    await Product.update(values, {
      where: {
        id,
      },
    });
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

export const getProductsFn = (limit?: number) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  let filters = {};
  if (limit) {
    filters = { limit };
  }
  try {
    dispatch(getProducts());
    const products = await Product.findAll(filters);
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
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await Product.create({
      title: values.title || null,
      sellPrice: values.sellPrice || null,
      sellPrice2: values.sellPrice2 || null,
      sellPrice3: values.sellPrice3 || null,
      buyPrice: values.buyPrice || null,
      postedBy: user.id,
    });

    if (cb) {
      cb();
    }
    toast.success('Successfully created');

    dispatch(createProductSuccess({}));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectProductState = (state: any) => state.product;

export default productSlice.reducer;
