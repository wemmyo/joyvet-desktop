import { createSlice } from '@reduxjs/toolkit';
// import { toast } from "react-toastify";
import CustomerModel from '../models/customer';

const initialState = {
  customers: {
    loading: true,
    data: [],
    error: {},
    // meta: {},
  },
  customerData: {
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
      // customers.data = [];
      customers.error = {};
    },
    getCustomersSuccess: (state, { payload }) => {
      let { customers } = state;
      customers.loading = false;
      customers.data = payload;
      //   customers.meta = payload.meta;
      customers.error = {};
    },
    getCustomersFailed: (state, { payload }) => {
      let { customers } = state;
      customers.loading = false;
      customers.data = [];
      customers.error = payload;
    },
    getSingleCustomer: (state) => {
      let { customerData } = state;
      customerData.loading = true;
      customerData.data = {};
      customerData.error = {};
    },
    getSingleCustomerSuccess: (state, { payload }) => {
      let { customerData } = state;
      customerData.loading = false;
      customerData.data = payload;
      customerData.error = {};
    },
    getSingleCustomerFailed: (state, { payload }) => {
      let { customerData } = state;
      customerData.loading = false;
      customerData.data = {};
      customerData.error = payload;
    },
  },
});

export const {
  getCustomers,
  getCustomersSuccess,
  getCustomersFailed,
  getSingleCustomer,
  getSingleCustomerSuccess,
  getSingleCustomerFailed,
} = customerSlice.actions;

export const getCustomersFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getCustomers());
    const response = await CustomerModel.findAll();

    dispatch(getCustomersSuccess(response));
  } catch (error) {
    dispatch(getCustomersFailed(error.response.data || error.response));
  }
};

// export const getSingleCustomerFn = (id: string) => async (
//   dispatch: (arg0: { payload: any; type: string }) => void
// ) => {
//   try {
//     dispatch(getSingleCustomer());
//     const response = await request({
//       method: 'get',
//       url: '/wallet/customer',
//       params: {
//         customerId: id,
//       },
//     });
//     dispatch(getSingleCustomerSuccess(response.data.wallet));
//   } catch (error) {
//     dispatch(getSingleCustomerFailed(error.response.data || error.response));
//   }
// };

export const selectCustomerState = (state: any) => state.customer;

export default customerSlice.reducer;
