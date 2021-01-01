import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import Supplier from '../models/supplier';

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

export const searchSupplierFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
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
  try {
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
  try {
    // dispatch(updateSupplier());
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
  try {
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
    const suppliers = await Supplier.findAll();
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
      postedBy: user.id,
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
