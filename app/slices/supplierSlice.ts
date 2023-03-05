import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import { ISupplier } from '../models/supplier';
import Payment, { IPayment } from '../models/payment';
import Purchase, { IPurchase } from '../models/purchase';
import type { RootState } from '../store';
import {
  createSupplier as createSupplierService,
  getSupplierById,
  getSuppliers as getSuppliersService,
  deleteSupplier as deleteSupplierService,
  updateSupplier as updateSupplierService,
} from '../services/supplier.service';

interface IState {
  singleSupplier: {
    loading: boolean;
    data: ISupplier;
  };
  suppliers: {
    loading: boolean;
    data: ISupplier[];
  };
  createSupplierState: {
    loading: boolean;
    data: ISupplier;
  };
  payments: {
    loading: boolean;
    data: IPayment[];
  };
  purchases: {
    loading: boolean;
    data: IPurchase[];
  };
}

const initialState: IState = {
  singleSupplier: {
    loading: false,
    data: {} as ISupplier,
  },
  suppliers: {
    loading: false,
    data: [],
  },
  createSupplierState: {
    loading: false,
    data: {} as ISupplier,
  },
  payments: {
    loading: false,
    data: [],
  },
  purchases: {
    loading: false,
    data: [],
  },
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    clearSingleSupplier: (state) => {
      const { singleSupplier } = state;
      singleSupplier.loading = false;
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
    },
    createSupplier: (state) => {
      const { createSupplierState } = state;
      createSupplierState.loading = true;
    },
    createSupplierSuccess: (state, { payload }) => {
      const { createSupplierState } = state;
      createSupplierState.loading = false;
      createSupplierState.data = payload;
    },
    createSupplierFailed: (state) => {
      const { createSupplierState } = state;
      createSupplierState.loading = false;
    },
    getPayments: (state) => {
      const { payments } = state;
      payments.loading = true;
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
    dispatch(getPaymentsSuccess(payments));
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
    dispatch(getPurchasesSuccess(purchases));
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
    const suppliers = await getSuppliersService({
      where: {
        fullName: {
          [Op.substring]: value,
        },
      },
    });
    dispatch(getSuppliersSuccess(suppliers));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteSupplierFn = (id: number, cb?: () => void) => async () => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });

  try {
    schema.parse({ id });
    // dispatch(updateCustomer());
    await deleteSupplierService(id);
    // dispatch(updateCustomerSuccess((updateCustomerResponse)));
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
  id: number,
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
    await updateSupplierService(id, values);
    // dispatch(updateSupplierSuccess((updateSupplierResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleSupplierFn = (id: number) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const schema = z.object({
    id: z.number(),
  });
  try {
    schema.parse({ id });
    dispatch(getSingleSupplier());
    const singleSupplier = await getSupplierById(id);
    dispatch(getSingleSupplierSuccess(singleSupplier));
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
    const suppliers = await getSuppliersService({
      order: [['fullName', 'ASC']],
    });
    dispatch(getSuppliersSuccess(suppliers));
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
    await createSupplierService({
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

export const selectSupplierState = (state: RootState) => state.supplier;

export default supplierSlice.reducer;
