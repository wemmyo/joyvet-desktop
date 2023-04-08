import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { Op } from 'sequelize';
import moment from 'moment';
import { z } from 'zod';
import {
  deleteExpense as deleteExpenseService,
  getExpenseById as getExpenseByIdService,
  getExpenses as getExpensesService,
  updateExpense as updateExpenseService,
  createExpense as createExpenseService,
} from '../services/expense.service';
import { IExpense } from '../models/expense';
import type { RootState } from '../store';
// import Expense from '../models/expense';

export const searchExpenseFn = async (value: string) => {
  // use zod to validate the input
  const searchExpenseSchema = z.object({
    value: z.string().min(1),
  });
  try {
    searchExpenseSchema.parse({ value });

    const expenses = await getExpensesService({
      where: {
        type: {
          [Op.substring]: value,
        },
      },
    });
    return expenses;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteExpenseFn = async (id: number, cb?: () => void) => {
  // use zod to validate the input
  const deleteExpenseSchema = z.object({
    id: z.number(),
  });
  try {
    deleteExpenseSchema.parse({ id });

    await deleteExpenseService(id);
    toast.success('Successfully deleted');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateExpenseFn = async (
  values: Partial<IExpense>,
  id: number,
  cb?: () => void
) => {
  // use zod to validate the input
  const updateExpenseSchema = z.object({
    id: z.number(),
  });
  try {
    updateExpenseSchema.parse({ id });

    await updateExpenseService(id, values);
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleExpenseFn = async (id: number, cb?: () => void) => {
  // use zod to validate the input
  const getSingleExpenseSchema = z.object({
    id: z.number(),
  });
  try {
    getSingleExpenseSchema.parse({ id });

    // const getSingleExpenseResponse = await Expense.findByPk(id);
    const response = await getExpenseByIdService(id);
    if (cb) {
      cb();
    }
    return response;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const filterExpensesFn = async ({ startDate, endDate }) => {
  // use zod to validate the input
  const filterExpensesSchema = z.object({
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  });
  try {
    filterExpensesSchema.parse({ startDate, endDate });

    const expenses = await getExpensesService({
      where: {
        date: {
          [Op.between]: [
            `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`,
            `${moment(endDate).format('YYYY-MM-DD')} 23:00:00`,
          ],
        },
      },
    });
    return expenses;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createExpenseFn = async (values: any, cb?: () => void) => {
  // use zod to validate the input
  const createExpenseSchema = z.object({
    type: z.string().min(1),
    amount: z.string().min(1),
    date: z.string().min(1),
    note: z.string().min(1),
  });
  try {
    createExpenseSchema.parse(values);

    const response = await createExpenseService(values);
    if (cb) {
      cb();
    }
    return response;
  } catch (error) {
    toast.error(error.message || '');
  }
};
