import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import { ICustomer } from '../models/customer';

import {
  getCustomers as getCustomersService,
  updateCustomer as updateCustomerService,
  deleteCustomer as deleteCustomerService,
  createCustomer as createCustomerService,
  getCustomerById as getCustomerByIdService,
} from '../services/customer.service';

import { getReceipts as getReceiptsService } from '../services/receipt.service';
import { getInvoices as getInvoicesService } from '../services/invoice.service';
import type { RootState } from '../store';
import { IReceipt } from '../models/receipt';
import { IInvoice } from '../models/invoice';

interface IState {
  singleCustomer: {
    loading: boolean;
    data: ICustomer;
  };
  customers: {
    loading: boolean;
    data: ICustomer[];
  };
  createCustomerState: {
    loading: boolean;
    data: ICustomer;
  };
  receipts: {
    loading: boolean;
    data: IReceipt[];
  };
  invoices: {
    loading: boolean;
    data: IInvoice[];
  };
}

const initialState: IState = {
  singleCustomer: {
    loading: false,
    data: {} as ICustomer,
  },
  customers: {
    loading: false,
    data: [],
  },
  createCustomerState: {
    loading: false,
    data: {} as ICustomer,
  },
  receipts: {
    loading: false,
    data: [],
  },
  invoices: {
    loading: false,
    data: [],
  },
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearSingleCustomer: (state) => {
      const { singleCustomer } = state;
      singleCustomer.loading = false;
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
    getReceipts: (state) => {
      const { receipts } = state;
      receipts.loading = true;
    },
    getReceiptsSuccess: (state, { payload }) => {
      const { receipts } = state;
      receipts.loading = false;
      receipts.data = payload;
    },
    getReceiptsFailed: (state) => {
      const { receipts } = state;
      receipts.loading = false;
    },
    getInvoices: (state) => {
      const { invoices } = state;
      invoices.loading = true;
    },
    getInvoicesSuccess: (state, { payload }) => {
      const { invoices } = state;
      invoices.loading = false;
      invoices.data = payload;
    },
    getInvoicesFailed: (state) => {
      const { invoices } = state;
      invoices.loading = false;
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
  getReceipts,
  getReceiptsSuccess,
  getReceiptsFailed,
  getInvoices,
  getInvoicesSuccess,
  getInvoicesFailed,
} = customerSlice.actions;

export const getCustomerReceiptsFn = (
  customerId: string | number,
  startDate?: Date | string,
  endDate?: Date | string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate the input
  const schema = z.object({
    customerId: z.number(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  });

  dispatch(getReceipts());
  try {
    schema.parse({ customerId, startDate, endDate });

    const receipts = await getReceiptsService({
      where: {
        customerId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });
    dispatch(getReceiptsSuccess(receipts));
  } catch (error) {
    dispatch(getReceiptsFailed());
    toast.error(error.message || '');
  }
};

export const getCustomerInvoicesFn = (
  customerId: string,
  startDate: Date | string,
  endDate: Date | string
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate the input

  const schema = z.object({
    customerId: z.number(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  });

  dispatch(getInvoices());
  try {
    schema.parse({ customerId, startDate, endDate });

    const invoices = await getInvoicesService({
      where: {
        customerId,
        createdAt: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
      order: [['createdAt', 'DESC']],
    });

    dispatch(getInvoicesSuccess(invoices));
  } catch (error) {
    dispatch(getInvoicesFailed());

    toast.error(error.message || '');
  }
};

export const searchCustomerFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate the input
  const schema = z.object({
    value: z.string().min(1),
  });
  try {
    schema.parse({ value });
    const customers = await getCustomersService({
      where: {
        fullName: {
          [Op.substring]: value,
        },
      },
    });
    dispatch(getCustomersSuccess(customers));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteCustomerFn = (id: number, cb?: () => void) => async () => {
  // use zod to validate the input
  const schema = z.object({
    id: z.number(),
  });
  try {
    schema.parse({ id });
    await deleteCustomerService(id);
    toast.success('Successfully deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateCustomerFn = (
  values: Partial<ICustomer>,
  id: number,
  cb?: () => void
) => async () => {
  // use zod to validate the input
  const schema = z.object({
    values: z.object({
      fullName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      address: z.string().min(1),
    }),
    id: z.number(),
  });

  try {
    schema.parse({ values, id });
    await updateCustomerService(id, values);
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleCustomerFn = (id: number, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate the input
  const schema = z.object({
    id: z.number(),
  });
  try {
    dispatch(getSingleCustomer());
    schema.parse({ id });

    const customer = await getCustomerByIdService(id);

    dispatch(getSingleCustomerSuccess(customer));
    if (cb) {
      cb();
    }
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

    const customers = await getCustomersService({
      order: [['fullName', 'ASC']],
    });
    dispatch(getCustomersSuccess(customers));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createCustomerFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  // use zod to validate the input
  const schema = z.object({
    values: z.object({
      fullName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      address: z.string().min(1),
    }),
  });
  try {
    dispatch(createCustomer());
    schema.parse({ values });
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';

    const customer = await createCustomerService({
      fullName: values.fullName,
      address: values.address,
      phoneNumber: values.phoneNumber,
      balance: values.balance,
      postedBy: user.fullName,
    });
    dispatch(createCustomerSuccess(customer));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectCustomerState = (state: RootState) => state.customer;

export default customerSlice.reducer;
