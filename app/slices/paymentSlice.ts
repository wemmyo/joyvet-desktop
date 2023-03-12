import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import Payment, { IPayment } from '../models/payment';
import Supplier from '../models/supplier';
import sequelize from '../utils/database';
import type { RootState } from '../store';
import {
  getPayments as getPaymentsService,
  getPaymentById,
  createPayment as createPaymentService,
  updatePayment as updatePaymentService,
} from '../services/payment.service';

interface IState {
  singlePayment: {
    loading: boolean;
    data: IPayment;
  };
  payments: {
    loading: boolean;
    data: IPayment[];
  };
  createPaymentState: {
    loading: boolean;
    data: IPayment;
  };
}

const initialState: IState = {
  singlePayment: {
    loading: false,
    data: {} as IPayment,
  },
  payments: {
    loading: false,
    data: [],
  },
  createPaymentState: {
    loading: false,
    data: {} as IPayment,
  },
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    getSinglePayment: (state) => {
      const { singlePayment } = state;
      singlePayment.loading = true;
    },
    getSinglePaymentSuccess: (state, { payload }) => {
      const { singlePayment } = state;
      singlePayment.loading = false;
      singlePayment.data = payload;
    },
    getSinglePaymentFailed: (state) => {
      const { singlePayment } = state;
      singlePayment.loading = false;
      singlePayment.data = {} as IPayment;
    },
    getPayments: (state) => {
      const { payments } = state;
      payments.loading = true;
    },
    getPaymentsSuccess: (state, { payload }) => {
      const { payments } = state;
      payments.loading = false;
      payments.data = payload;
    },
    getPaymentsFailed: (state) => {
      const { payments } = state;
      payments.loading = false;
      payments.data = [];
    },
    createPayment: (state) => {
      const { createPaymentState } = state;
      createPaymentState.loading = true;
    },
    createPaymentSuccess: (state, { payload }) => {
      const { createPaymentState } = state;
      createPaymentState.loading = false;
      createPaymentState.data = payload;
    },
    createPaymentFailed: (state) => {
      const { createPaymentState } = state;
      createPaymentState.loading = false;
    },
  },
});

export const {
  getSinglePayment,
  getSinglePaymentSuccess,
  getSinglePaymentFailed,
  getPayments,
  getPaymentsSuccess,
  getPaymentsFailed,
  createPayment,
  createPaymentSuccess,
  createPaymentFailed,
} = paymentSlice.actions;

export const searchPaymentFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const searchPaymentSchema = z.object({
    value: z.string().min(1),
  });
  try {
    searchPaymentSchema.parse({ value });
    dispatch(getPayments());
    const payments = await getPaymentsService({
      where: {
        id: {
          [Op.startsWith]: value,
        },
      },
    });
    dispatch(getPaymentsSuccess(payments));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updatePaymentFn = (
  values: Partial<IPayment>,
  id: number,
  cb?: () => void
) => async () => {
  // use zod to validate input
  const updatePaymentSchema = z.object({
    id: z.number(),
    values: z.object({
      amount: z.number().min(1),
      supplierId: z.number(),
      paymentDate: z.string().min(1),
    }),
  });
  try {
    updatePaymentSchema.parse({ id, values });
    // dispatch(updatePayment());
    await updatePaymentService(id, values);
    // dispatch(updatePaymentSuccess((updatePaymentResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSinglePaymentFn = (id: number, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const getSinglePaymentSchema = z.object({
    id: z.number(),
  });
  try {
    getSinglePaymentSchema.parse({ id });
    dispatch(getSinglePayment());
    const payment = await getPaymentById(id, {
      include: Supplier,
    });

    dispatch(getSinglePaymentSuccess(payment));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getPaymentsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getPayments());
    const payments = await getPaymentsService({});
    dispatch(getPaymentsSuccess(payments));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deletePaymentFn = (
  id: string | number,
  cb: () => void
) => async () => {
  // use zod to validate input
  const deletePaymentSchema = z.object({
    id: z.number(),
  });
  try {
    deletePaymentSchema.parse({ id });
    await sequelize.transaction(async (t) => {
      const payment = await Payment.findByPk(id);

      const updateBalance = await Supplier.increment('balance', {
        by: payment.amount,
        where: { id: payment.supplierId },
        transaction: t,
      });

      const deletePayment = await payment.destroy({ transaction: t });

      await Promise.all([updateBalance, deletePayment]);
    });
    toast.success('Payment successfully deleted');
    cb();
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createPaymentFn = (values: any, cb: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const createPaymentSchema = z.object({
    values: z.object({
      amount: z.number().min(1),
      supplierId: z.number(),
      paymentDate: z.string().min(1),
    }),
  });
  try {
    createPaymentSchema.parse({ values });
    await sequelize.transaction(async (t) => {
      dispatch(createPayment());
      const user =
        localStorage.getItem('user') !== null
          ? JSON.parse(localStorage.getItem('user') || '')
          : '';

      await Payment.create(
        {
          supplierId: values.supplierId || null,
          amount: values.amount || null,
          paymentType: values.paymentType || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      await Supplier.decrement('balance', {
        by: values.amount,
        where: { id: values.supplierId },
        transaction: t,
      });

      toast.success('Payment successfully created');
    });
    cb();
    dispatch(createPaymentSuccess({}));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectPaymentState = (state: RootState) => state.payment;

export default paymentSlice.reducer;
