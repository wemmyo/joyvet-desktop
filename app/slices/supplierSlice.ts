import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import SupplierModel from '../models/supplier';

const initialState = {
  suppliers: {
    loading: false,
    data: '',
  },
  createSupplierState: {
    loading: false,
    data: '',
  },
  singleSupplier: {
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
} = supplierSlice.actions;

export const getSingleSupplierFn = (supplierId: number | string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getSingleSupplier());
    const singleSupplier = await SupplierModel.findByPk(supplierId);
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
    const suppliers = await SupplierModel.findAll();
    dispatch(getSuppliersSuccess(JSON.stringify(suppliers)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createSupplierFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createSupplier());
    // const response = await SupplierModel.create(values);
    await SupplierModel.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || null,
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
