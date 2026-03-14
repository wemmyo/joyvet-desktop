import { toast } from 'sonner';
import { IExpense } from '../models/expense';

export const searchExpenseFn = async (value: string) => {
  try {
    return await window.api.expense.search(value);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deleteExpenseFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.expense.delete(id);
    toast.success('Successfully deleted');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const updateExpenseFn = async (
  values: Partial<IExpense>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.expense.update(id, values);
    toast.success('Successfully updated');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSingleExpenseFn = async (id: number, cb?: () => void) => {
  try {
    const response = await window.api.expense.getById(id);
    if (cb) cb();
    return response;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const filterExpensesFn = async ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  try {
    return await window.api.expense.filter(startDate, endDate);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createExpenseFn = async (values: any, cb?: () => void) => {
  try {
    const response = await window.api.expense.create(values);
    if (cb) cb();
    return response;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
