import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import Customer from '../models/customer';

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
    clearSingleCustomer: (state) => {
      const { singleCustomer } = state;
      singleCustomer.loading = false;
      singleCustomer.data = '';
    },
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
  clearSingleCustomer,
  getCustomers,
  getCustomersSuccess,
  getCustomersFailed,
  createCustomer,
  createCustomerSuccess,
  createCustomerFailed,
} = customerSlice.actions;

export const searchCustomerFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    const customers = await Customer.findAll({
      where: {
        fullName: {
          [Op.substring]: value,
        },
      },
    });
    dispatch(getCustomersSuccess(JSON.stringify(customers)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteCustomerFn = (
  id: string | number,
  cb?: () => void
) => async () => {
  try {
    // dispatch(updateCustomer());
    await Customer.destroy({
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

export const updateCustomerFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
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

export const clearSingleCustomerFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  dispatch(clearSingleCustomer());
};

export const getCustomersFn = () => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  try {
    dispatch(getCustomers());
    const customers = await Customer.findAll({ order: [['fullName', 'ASC']] });
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
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    const createCustomerResponse = await Customer.create({
      fullName: values.fullName || null,
      address: values.address || null,
      phoneNumber: values.phoneNumber || null,
      balance: values.balance || 0,
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
