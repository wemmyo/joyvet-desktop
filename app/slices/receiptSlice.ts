import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import Receipt, { IReceipt } from '../models/receipt';
import Customer from '../models/customer';
import sequelize from '../utils/database';
import type { RootState } from '../store';
import { getReceipts as getReceiptsService } from '../services/receipt.service';

interface IState {
  singleReceipt: {
    loading: boolean;
    data: IReceipt;
  };
  receipts: {
    loading: boolean;
    data: IReceipt[];
  };
  createReceiptState: {
    loading: boolean;
    data: IReceipt;
  };
}

const initialState: IState = {
  singleReceipt: {
    loading: false,
    data: {} as IReceipt,
  },
  receipts: {
    loading: true,
    data: [],
  },
  createReceiptState: {
    loading: false,
    data: {} as IReceipt,
  },
};

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    getSingleReceipt: (state) => {
      const { singleReceipt } = state;
      singleReceipt.loading = true;
    },
    getSingleReceiptSuccess: (state, { payload }) => {
      const { singleReceipt } = state;
      singleReceipt.loading = false;
      singleReceipt.data = payload;
    },
    getSingleReceiptFailed: (state) => {
      const { singleReceipt } = state;
      singleReceipt.loading = false;
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
    createReceipt: (state) => {
      const { createReceiptState } = state;
      createReceiptState.loading = true;
    },
    createReceiptSuccess: (state, { payload }) => {
      const { createReceiptState } = state;
      createReceiptState.loading = false;
      createReceiptState.data = payload;
    },
    createReceiptFailed: (state) => {
      const { createReceiptState } = state;
      createReceiptState.loading = false;
    },
  },
});

export const {
  getSingleReceipt,
  getSingleReceiptSuccess,
  getSingleReceiptFailed,
  getReceipts,
  getReceiptsSuccess,
  getReceiptsFailed,
  createReceipt,
  createReceiptSuccess,
  createReceiptFailed,
} = receiptSlice.actions;

export const searchReceiptFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const SearchReceiptSchema = z.object({
    value: z.string().min(1),
  });
  try {
    SearchReceiptSchema.parse({ value });

    const receipts = await getReceiptsService({
      where: {
        id: {
          [Op.startsWith]: value,
        },
      },
      include: [
        {
          model: Customer,
        },
      ],
    });
    dispatch(getReceiptsSuccess(receipts));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateReceiptFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
  // use zod to validate input
  const UpdateReceiptSchema = z.object({
    amount: z.number().min(1),
    customerId: z.number(),
    id: z.number(),
  });

  try {
    UpdateReceiptSchema.parse(values);
    // dispatch(updateReceipt());
    await Receipt.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updateReceiptSuccess((updateReceiptResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleReceiptFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate input
  const GetSingleReceiptSchema = z.object({
    id: z.number(),
  });

  try {
    dispatch(getSingleReceipt());
    GetSingleReceiptSchema.parse({ id });
    const getSingleReceiptResponse = await Receipt.findByPk(id, {
      include: Customer,
    });

    dispatch(getSingleReceiptSuccess(getSingleReceiptResponse));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getReceiptsFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getReceipts());
    const receipts = await Receipt.findAll({
      include: [
        {
          model: Customer,
        },
      ],
    });
    dispatch(getReceiptsSuccess(receipts));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteReceiptFn = (
  id: string | number,
  cb: () => void
) => async () => {
  // use zod to validate input
  const DeleteReceiptSchema = z.object({
    id: z.number(),
  });
  try {
    DeleteReceiptSchema.parse({ id });
    await sequelize.transaction(async (t) => {
      const receipt = await Receipt.findByPk(id);

      // update customers balance
      const updateBalance = await Customer.increment('balance', {
        by: receipt.amount,
        where: {
          id: receipt.customerId,
        },
        transaction: t,
      });

      const deleteReceipt = await receipt.destroy({ transaction: t });

      await Promise.all([updateBalance, deleteReceipt]);

      cb();
      toast.success('Receipt successfully deleted');
    });
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createReceiptFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate input
  const CreateReceiptSchema = z.object({
    amount: z.number().min(1),
    customerId: z.number(),
    paymentMethod: z.string().min(1),
  });
  try {
    CreateReceiptSchema.parse(values);
    await sequelize.transaction(async (t) => {
      dispatch(createReceipt());
      const user =
        localStorage.getItem('user') !== null
          ? JSON.parse(localStorage.getItem('user') || '')
          : '';
      await Receipt.create(
        {
          customerId: values.customerId || null,
          amount: values.amount || null,
          paymentMethod: values.paymentMethod || null,
          bank: values.bank || null,
          note: values.note || null,
          postedBy: user.fullName,
        },
        { transaction: t }
      );

      await Customer.decrement('balance', {
        by: values.amount,
        where: { id: values.customerId },
        transaction: t,
      });
    });
    dispatch(createReceiptSuccess({}));
    toast.success('Receipt successfully created');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectReceiptState = (state: RootState) => state.receipt;

export default receiptSlice.reducer;
