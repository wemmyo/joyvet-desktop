import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import moment from 'moment';
import Product from '../models/product';
import InvoiceItem from '../models/invoiceItem';
import PurchaseItem from '../models/purchaseItem';

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
  purchases: {
    loading: false,
    data: '',
  },
  invoices: {
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
    getPurchases: (state) => {
      const { purchases } = state;
      purchases.loading = true;
      purchases.data = '';
    },
    getPurchasesSuccess: (state, { payload }) => {
      const { purchases } = state;
      purchases.loading = false;
      purchases.data = payload;
    },
    getPurchasesFailed: (state) => {
      const { purchases } = state;
      purchases.loading = false;
    },
    getInvoices: (state) => {
      const { invoices } = state;
      invoices.loading = true;
      invoices.data = '';
    },
    getInvoicesSuccess: (state, { payload }) => {
      const { invoices } = state;
      invoices.loading = false;
      invoices.data = payload;
    },
    getInvoicesFailed: (state) => {
      const { invoices } = state;
      invoices.loading = false;
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
  getPurchases,
  getPurchasesSuccess,
  getPurchasesFailed,
  getInvoices,
  getInvoicesSuccess,
  getInvoicesFailed,
} = productSlice.actions;

export const getProductPurchasesFn = (
  productId: string | number,
  startDate?: Date | string,
  endDate?: Date | string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate input
  const schema = z.object({
    productId: z.number(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  });

  dispatch(getPurchases());
  try {
    schema.parse({ productId, startDate, endDate });
    const receipts = await PurchaseItem.findAll({
      where: {
        productId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    dispatch(getPurchasesSuccess(JSON.stringify(receipts)));
  } catch (error) {
    dispatch(getPurchasesFailed());
    toast.error(error.message || '');
  }
};

export const getProductInvoicesFn = (
  productId: string,
  startDate: Date | string,
  endDate: Date | string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate input
  const schema = z.object({
    productId: z.number(),
    startDate: z.date(),
    endDate: z.date(),
  });
  dispatch(getInvoices());
  try {
    schema.parse({ productId, startDate, endDate });
    const invoices = await InvoiceItem.findAll({
      where: {
        productId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    dispatch(getInvoicesSuccess(JSON.stringify(invoices)));
  } catch (error) {
    dispatch(getInvoicesFailed());

    toast.error(error.message || '');
  }
};

export const searchProductFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const schema = z.object({
    value: z.string().min(1),
  });
  try {
    schema.parse({ value });
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
  // use zod to validate input
  const schema = z.object({
    values: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      price: z.number(),
      quantity: z.number(),
      category: z.string().min(1),
    }),
    id: z.number(),
  });
  try {
    schema.parse({ values, id });
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
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });

  try {
    dispatch(getSingleProduct());
    schema.parse({ id });

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

export const getProductsFn = (filter?: 'inStock') => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  let filters = {};
  if (filter === 'inStock') {
    filters = {
      where: {
        stock: { [Op.gt]: 0 },
      },
    };
  }

  try {
    dispatch(getProducts());
    const products = await Product.findAll({
      ...filters,
      order: [['title', 'ASC']],
    });
    dispatch(getProductsSuccess(JSON.stringify(products)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createProductFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const schema = z.object({
    values: z.object({
      title: z.string().min(1),
      sellPrice: z.number(),
      sellPrice2: z.number(),
      sellPrice3: z.number(),
      buyPrice: z.number(),
    }),
  });
  try {
    schema.parse({ values });
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
      postedBy: user.fullName,
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
