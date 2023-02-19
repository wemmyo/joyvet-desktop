import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import Supplier from '../models/supplier';
import Payment from '../models/payment';
import Purchase from '../models/purchase';

const initialState = {
  singleSupplier: {
    loading: false,
    data: '',
  },
  suppliers: {
    loading: false,
    data: '',
  },
  createSupplierState: {
    loading: false,
    data: '',
  },
  payments: {
    loading: false,
    data: '',
  },
  purchases: {
    loading: false,
    data: '',
  },
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    clearSingleSupplier: (state) => {
      const { singleSupplier } = state;
      singleSupplier.loading = false;
      singleSupplier.data = '';
    },
    getSingleSupplier: (state) => {
      const { singleSupplier } = state;
      singleSupplier.loading = true;
    },
    getSingleSupplierSuccess: (state, { payload }) => {
      const { singleSupplier } = state;
      singleSupplier.loading = false;
      singleSupplier.data = payload;
    },
    getSingleSupplierFailed: (state) => {
      const { singleSupplier } = state;
      singleSupplier.loading = false;
      singleSupplier.data = '';
    },
    getSuppliers: (state) => {
      const { suppliers } = state;
      suppliers.loading = true;
    },
    getSuppliersSuccess: (state, { payload }) => {
      const { suppliers } = state;
      suppliers.loading = false;
      suppliers.data = payload;
    },
    getSuppliersFailed: (state) => {
      const { suppliers } = state;
      suppliers.loading = false;
      suppliers.data = '';
    },
    createSupplier: (state) => {
      const { createSupplierState } = state;
      createSupplierState.loading = true;
      createSupplierState.data = '';
    },
    createSupplierSuccess: (state, { payload }) => {
      const { createSupplierState } = state;
      createSupplierState.loading = false;
      createSupplierState.data = payload;
    },
    createSupplierFailed: (state) => {
      const { createSupplierState } = state;
      createSupplierState.loading = false;
      createSupplierState.data = '';
    },
    getPayments: (state) => {
      const { payments } = state;
      payments.loading = true;
      payments.data = '';
    },
    getPaymentsSuccess: (state, { payload }) => {
      const { payments } = state;
      payments.loading = false;
      payments.data = payload;
    },
    getPaymentsFailed: (state) => {
      const { payments } = state;
      payments.loading = false;
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
  },
});

export const {
  getSingleSupplier,
  getSingleSupplierSuccess,
  getSingleSupplierFailed,
  clearSingleSupplier,
  getSuppliers,
  getSuppliersSuccess,
  getSuppliersFailed,
  createSupplier,
  createSupplierSuccess,
  createSupplierFailed,
  getPayments,
  getPaymentsSuccess,
  getPaymentsFailed,
  getPurchases,
  getPurchasesSuccess,
  getPurchasesFailed,
} = supplierSlice.actions;

export const getSupplierPaymentsFn = (
  supplierId: string | number,
  startDate?: Date | string,
  endDate?: Date | string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate input
  const schema = z.object({
    supplierId: z.number(),
    startDate: z.date(),
    endDate: z.date(),
  });
  dispatch(getPayments());
  try {
    schema.parse({ supplierId, startDate, endDate });
    const payments = await Payment.findAll({
      where: {
        supplierId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    dispatch(getPaymentsSuccess(JSON.stringify(payments)));
  } catch (error) {
    dispatch(getPaymentsFailed());
    toast.error(error.message || '');
  }
};

export const getSupplierPurchasesFn = (
  supplierId: string,
  startDate: Date | string,
  endDate: Date | string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate input
  const schema = z.object({
    supplierId: z.number(),
    startDate: z.date(),
    endDate: z.date(),
  });

  dispatch(getPurchases());
  try {
    schema.parse({ supplierId, startDate, endDate });
    const purchases = await Purchase.findAll({
      where: {
        supplierId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    dispatch(getPurchasesSuccess(JSON.stringify(purchases)));
  } catch (error) {
    dispatch(getPurchasesFailed());

    toast.error(error.message || '');
  }
};

export const searchSupplierFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const schema = z.object({
    value: z.string().min(1),
  });
  try {
    schema.parse({ value });
    const suppliers = await Supplier.findAll({
      where: {
        fullName: {
          [Op.substring]: value,
        },
      },
    });
    dispatch(getSuppliersSuccess(JSON.stringify(suppliers)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteSupplierFn = (
  id: string | number,
  cb?: () => void
) => async () => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });

  try {
    schema.parse({ id });
    // dispatch(updateCustomer());
    await Supplier.destroy({
      where: {
        id,
      },
    });
    // dispatch(updateCustomerSuccess(JSON.stringify(updateCustomerResponse)));
    toast.success('Successfully deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateSupplierFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
    fullName: z.string().min(1),
    phoneNumber: z.string().min(1),
    email: z.string().min(1),
    address: z.string().min(1),
  });
  try {
    // dispatch(updateSupplier());
    schema.parse({ ...values, id });
    await Supplier.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updateSupplierSuccess(JSON.stringify(updateSupplierResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleSupplierFn = (supplierId: number | string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const schema = z.object({
    supplierId: z.number(),
  });
  try {
    schema.parse({ supplierId });
    dispatch(getSingleSupplier());
    const singleSupplier = await Supplier.findByPk(supplierId);
    dispatch(getSingleSupplierSuccess(JSON.stringify(singleSupplier)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const clearSingleSupplierFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  dispatch(clearSingleSupplier());
};

export const getSuppliersFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getSuppliers());
    const suppliers = await Supplier.findAll({ order: [['fullName', 'ASC']] });
    dispatch(getSuppliersSuccess(JSON.stringify(suppliers)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createSupplierFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const schema = z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string().min(1),
    address: z.string().min(1),
  });
  try {
    dispatch(createSupplier());
    schema.parse(values);
    // const response = await Supplier.create(values);
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await Supplier.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || 0,
      postedBy: user.fullName,
    });

    dispatch(createSupplierSuccess({}));
    toast.success('Supplier successfully created');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectSupplierState = (state: any) => state.supplier;

export default supplierSlice.reducer;
