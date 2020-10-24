import { createSlice } from '@reduxjs/toolkit';
import CustomerModel from '../models/customer';
import { toast } from 'react-toastify';

const initialState = {
  customers: {
    loading: true,
    data: [],
    error: {},
  },
  createCustomerState: {
    loading: false,
    data: {},
    error: {},
  },
};

const customerSlice = createSlice({
  name: 'customer',
  initialState: initialState,
  reducers: {
    getCustomers: (state) => {
      let { customers } = state;
      customers.loading = true;
      customers.error = {};
    },
    getCustomersSuccess: (state, { payload }) => {
      let { customers } = state;
      customers.loading = false;
      customers.data = payload;
      customers.error = {};
    },
    getCustomersFailed: (state, { payload }) => {
      let { customers } = state;
      customers.loading = false;
      customers.data = [];
      customers.error = payload;
    },
    createCustomer: (state) => {
      let { createCustomerState } = state;
      createCustomerState.loading = true;
      createCustomerState.data = {};
      createCustomerState.error = {};
    },
    createCustomerSuccess: (state, { payload }) => {
      let { createCustomerState } = state;
      createCustomerState.loading = false;
      createCustomerState.data = payload;
      createCustomerState.error = {};
    },
    createCustomerFailed: (state, { payload }) => {
      let { createCustomerState } = state;
      createCustomerState.loading = false;
      createCustomerState.data = {};
      createCustomerState.error = payload;
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
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getCustomers());
    const response = await CustomerModel.findAll({
      raw: true,
    });
    // console.log((await CustomerModel.findAll()).toJSON());
    console.log(response);
    dispatch(getCustomersSuccess(response));
  } catch (error) {
    console.log(error);

    dispatch(getCustomersFailed({}));
  }
};

export const createCustomerFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createCustomer());
    // const response = await CustomerModel.create(values);
    const response = await CustomerModel.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || null,
    });
    console.log(response);
    toast.success('Customer successfully created');

    cb();
    dispatch(createCustomerSuccess({}));
  } catch (error) {
    dispatch(createCustomerFailed({}));
    console.log(error);
  }
};

export const selectCustomerState = (state: any) => state.customer;

export default customerSlice.reducer;
