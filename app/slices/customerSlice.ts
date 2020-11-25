import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import Customer from '../models/customer';

const user =
  localStorage.getItem('user') !== null
    ? JSON.parse(localStorage.getItem('user') || '')
    : '';

const initialState = {
  singleCustomer: {
    loading: false,
    data: '',
  },
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
    getSingleCustomer: (state) => {
      const { singleCustomer } = state;
      singleCustomer.loading = true;
    },
    getSingleCustomerSuccess: (state, { payload }) => {
      const { singleCustomer } = state;
      singleCustomer.loading = false;
      singleCustomer.data = payload;
    },
    getSingleCustomerFailed: (state) => {
      const { singleCustomer } = state;
      singleCustomer.loading = false;
      singleCustomer.data = '';
    },
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
  getSingleCustomer,
  getSingleCustomerSuccess,
  getSingleCustomerFailed,
  getCustomers,
  getCustomersSuccess,
  getCustomersFailed,
  createCustomer,
  createCustomerSuccess,
  createCustomerFailed,
} = customerSlice.actions;

export const updateCustomerFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    // dispatch(updateCustomer());
    await Customer.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updateCustomerSuccess(JSON.stringify(updateCustomerResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleCustomerFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    dispatch(getSingleCustomer());

    const getSingleCustomerResponse = await Customer.findByPk(id);

    dispatch(
      getSingleCustomerSuccess(JSON.stringify(getSingleCustomerResponse))
    );
    if (cb) {
      cb();
    }
    console.log(getSingleCustomerResponse);
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getCustomersFn = () => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  try {
    dispatch(getCustomers());
    const customers = await Customer.findAll();
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
    const createCustomerResponse = await Customer.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || null,
      postedBy: user.id,
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
