import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import CustomerModel from '../models/customer';

const initialState = {
  customers: {
    loading: false,
    data: '',
  },
  createCustomerState: {
    loading: false,
    data: '',
  },
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    getCustomers: (state) => {
      const { customers } = state;
      customers.loading = true;
    },
    getCustomersSuccess: (state, { payload }) => {
      const { customers } = state;
      customers.loading = false;
      customers.data = payload;
    },
    getCustomersFailed: (state) => {
      const { customers } = state;
      customers.loading = false;
    },
    createCustomer: (state) => {
      const { createCustomerState } = state;
      createCustomerState.loading = true;
      createCustomerState.data = '';
    },
    createCustomerSuccess: (state, { payload }) => {
      const { createCustomerState } = state;
      createCustomerState.loading = false;
      createCustomerState.data = payload;
    },
    createCustomerFailed: (state) => {
      const { createCustomerState } = state;
      createCustomerState.loading = false;
    },
  },
});

export const {
  getCustomers,
  getCustomersSuccess,
  getCustomersFailed,
  createCustomer,
  createCustomerSuccess,
  createCustomerFailed,
} = customerSlice.actions;

export const getCustomersFn = () => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  try {
    dispatch(getCustomers());
    const customers = await CustomerModel.findAll();
    dispatch(getCustomersSuccess(JSON.stringify(customers)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createCustomerFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  try {
    dispatch(createCustomer());
    const createCustomerResponse = await CustomerModel.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || null,
    });
    dispatch(createCustomerSuccess(JSON.stringify(createCustomerResponse)));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectCustomerState = (state: any) => state.customer;

export default customerSlice.reducer;
