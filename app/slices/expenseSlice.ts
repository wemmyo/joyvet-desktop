import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import Expense from '../models/expense';

const initialState = {
  singleExpense: {
    loading: false,
    data: '',
  },
  expenses: {
    loading: false,
    data: '',
  },
  createExpenseState: {
    loading: false,
    data: '',
  },
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearSingleExpense: (state) => {
      const { singleExpense } = state;
      singleExpense.loading = false;
      singleExpense.data = '';
    },
    getSingleExpense: (state) => {
      const { singleExpense } = state;
      singleExpense.loading = true;
    },
    getSingleExpenseSuccess: (state, { payload }) => {
      const { singleExpense } = state;
      singleExpense.loading = false;
      singleExpense.data = payload;
    },
    getSingleExpenseFailed: (state) => {
      const { singleExpense } = state;
      singleExpense.loading = false;
      singleExpense.data = '';
    },
    getExpenses: (state) => {
      const { expenses } = state;
      expenses.loading = true;
    },
    getExpensesSuccess: (state, { payload }) => {
      const { expenses } = state;
      expenses.loading = false;
      expenses.data = payload;
    },
    getExpensesFailed: (state) => {
      const { expenses } = state;
      expenses.loading = false;
    },
    createExpense: (state) => {
      const { createExpenseState } = state;
      createExpenseState.loading = true;
      createExpenseState.data = '';
    },
    createExpenseSuccess: (state, { payload }) => {
      const { createExpenseState } = state;
      createExpenseState.loading = false;
      createExpenseState.data = payload;
    },
    createExpenseFailed: (state) => {
      const { createExpenseState } = state;
      createExpenseState.loading = false;
    },
  },
});

export const {
  getSingleExpense,
  getSingleExpenseSuccess,
  getSingleExpenseFailed,
  clearSingleExpense,
  getExpenses,
  getExpensesSuccess,
  getExpensesFailed,
  createExpense,
  createExpenseSuccess,
  createExpenseFailed,
} = expenseSlice.actions;

export const searchExpenseFn = (value: string) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  // use zod to validate the input
  const searchExpenseSchema = z.object({
    value: z.string().min(1),
  });
  try {
    searchExpenseSchema.parse({ value });
    const expenses = await Expense.findAll({
      where: {
        type: {
          [Op.substring]: value,
        },
      },
    });
    dispatch(getExpensesSuccess(JSON.stringify(expenses)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteExpenseFn = (
  id: string | number,
  cb?: () => void
) => async () => {
  // use zod to validate the input
  const deleteExpenseSchema = z.object({
    id: z.number(),
  });
  try {
    deleteExpenseSchema.parse({ id });
    // dispatch(updateExpense());
    await Expense.destroy({
      where: {
        id,
      },
    });
    // dispatch(updateExpenseSuccess(JSON.stringify(updateExpenseResponse)));
    toast.success('Successfully deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateExpenseFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async () => {
  // use zod to validate the input
  const updateExpenseSchema = z.object({
    id: z.number(),
  });
  try {
    updateExpenseSchema.parse({ id });
    // dispatch(updateExpense());
    await Expense.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updateExpenseSuccess(JSON.stringify(updateExpenseResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleExpenseFn = (
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  // use zod to validate the input
  const getSingleExpenseSchema = z.object({
    id: z.number(),
  });
  try {
    dispatch(getSingleExpense());
    getSingleExpenseSchema.parse({ id });

    const getSingleExpenseResponse = await Expense.findByPk(id);

    dispatch(getSingleExpenseSuccess(JSON.stringify(getSingleExpenseResponse)));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const clearSingleExpenseFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  dispatch(clearSingleExpense());
};

export const filterExpensesFn = ({ startDate, endDate }) => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  // use zod to validate the input
  const filterExpensesSchema = z.object({
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  });
  try {
    filterExpensesSchema.parse({ startDate, endDate });
    dispatch(getExpenses());

    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
    });
    dispatch(getExpensesSuccess(JSON.stringify(expenses)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createExpenseFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  // use zod to validate the input
  const createExpenseSchema = z.object({
    type: z.string().min(1),
    amount: z.string().min(1),
    date: z.string().min(1),
    note: z.string().min(1),
  });
  try {
    dispatch(createExpense());
    createExpenseSchema.parse(values);

    const createExpenseResponse = await Expense.create({
      type: values.type || null,
      amount: values.amount || null,
      date: values.date || null,
      note: values.note || null,
    });
    dispatch(createExpenseSuccess(JSON.stringify(createExpenseResponse)));
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectExpenseState = (state: any) => state.expense;

export default expenseSlice.reducer;
