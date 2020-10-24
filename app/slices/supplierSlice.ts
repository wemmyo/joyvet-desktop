import { createSlice } from '@reduxjs/toolkit';
import SupplierModel from '../models/supplier';
import { toast } from 'react-toastify';

const initialState = {
  supplier: {
    loading: true,
    data: [],
    error: {},
  },
  createSupplierState: {
    loading: false,
    data: {},
    error: {},
  },
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState: initialState,
  reducers: {
    getSuppliers: (state) => {
      let { supplier } = state;
      supplier.loading = true;
      supplier.error = {};
    },
    getSuppliersSuccess: (state, { payload }) => {
      let { supplier } = state;
      supplier.loading = false;
      supplier.data = payload;
      supplier.error = {};
    },
    getSuppliersFailed: (state, { payload }) => {
      let { supplier } = state;
      supplier.loading = false;
      supplier.data = [];
      supplier.error = payload;
    },
    createSupplier: (state) => {
      let { createSupplierState } = state;
      createSupplierState.loading = true;
      createSupplierState.data = {};
      createSupplierState.error = {};
    },
    createSupplierSuccess: (state, { payload }) => {
      let { createSupplierState } = state;
      createSupplierState.loading = false;
      createSupplierState.data = payload;
      createSupplierState.error = {};
    },
    createSupplierFailed: (state, { payload }) => {
      let { createSupplierState } = state;
      createSupplierState.loading = false;
      createSupplierState.data = {};
      createSupplierState.error = payload;
    },
  },
});

export const {
  getSuppliers,
  getSuppliersSuccess,
  getSuppliersFailed,
  createSupplier,
  createSupplierSuccess,
  createSupplierFailed,
} = supplierSlice.actions;

export const getSuppliersFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getSuppliers());
    const response = await SupplierModel.findAll({
      raw: true,
    });
    console.log(response);
    dispatch(getSuppliersSuccess(response));
  } catch (error) {
    console.log(error);

    dispatch(getSuppliersFailed({}));
  }
};

export const createSupplierFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createSupplier());
    // const response = await SupplierModel.create(values);
    const response = await SupplierModel.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || null,
    });
    console.log(response);
    toast.success('Supplier successfully created');

    cb();
    dispatch(createSupplierSuccess({}));
  } catch (error) {
    dispatch(createSupplierFailed({}));
    console.log(error);
  }
};

export const selectSupplierState = (state: any) => state.supplier;

export default supplierSlice.reducer;
