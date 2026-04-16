import { toast } from 'sonner';
import type { IExpense } from '../models/expense';

export const searchExpenseFn = async (value: string): Promise<IExpense[]> => {
  try {
    const result = await window.api.expense.search({ search: value });
    return result.rows ?? [];
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};

export const deleteExpenseFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.expense.delete(id);
    toast.success('Successfully deleted');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};

export const getSingleExpenseFn = async (id: number, cb?: () => void) => {
  try {
    const response = await window.api.expense.getById(id);
    if (cb) cb();
    return response;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return null;
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};

export const createExpenseFn = async (
  values: Partial<IExpense>,
  cb?: () => void
) => {
  try {
    const response = await window.api.expense.create(values);
    toast.success('Expense created successfully');
    if (cb) cb();
    return response;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return undefined;
  }
};
