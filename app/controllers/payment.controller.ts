import { toast } from 'sonner';
import { IPayment } from '../models/payment';
import type {
  PaginatedResult,
  PaginationQuery,
  SearchPaginationQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptyPayments = (query?: PaginationQuery): PaginatedResult<IPayment> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const searchPaymentFn = async (
  query: SearchPaginationQuery
): Promise<PaginatedResult<IPayment>> => {
  try {
    return await window.api.payment.search(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyPayments(query);
  }
};

export const updatePaymentFn = async (
  values: Partial<IPayment>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.payment.update(id, values);
    toast.success('Successfully updated');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSinglePaymentFn = async (id: number, cb?: () => void) => {
  try {
    const payment = await window.api.payment.getById(id);
    if (cb) cb();
    return payment;
  } catch (error: any) {
    toast.error(error.message || '');
    return null;
  }
};

export const getPaymentsFn = async (
  query?: PaginationQuery
): Promise<PaginatedResult<IPayment>> => {
  try {
    return await window.api.payment.getAll(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyPayments(query);
  }
};

export const deletePaymentFn = async (id: string | number) => {
  try {
    await window.api.payment.delete(id as number);
    toast.success('Payment successfully deleted');
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createPaymentFn = async (values: any, cb?: () => void) => {
  try {
    const user = getUserSession();
    await window.api.payment.create({
      ...values,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Payment successfully created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
