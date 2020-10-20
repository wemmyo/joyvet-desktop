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
  getSingleCustomer,
  getSingleCustomerSuccess,
  getSingleCustomerFailed,
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
      // raw: true,
    });
    console.log(response);

    dispatch(getCustomersSuccess(response));
  } catch (error) {
    dispatch(getCustomersFailed({}));
  }
};
export const createCustomerFn = (cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createCustomer());
    const response = await CustomerModel.create({
      fullName: 'Oyedeji Wemimo',
      address: 'Block 185, flat 3, LSDPC IV, Ogba, Lagos',
      phoneNumber: '08080062284',
      balance: 1000,
    });
    console.log("Wemimo's auto-generated ID:", response.id);
    cb();

    dispatch(createCustomerSuccess({}));
  } catch (error) {
    dispatch(createCustomerFailed({}));
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
