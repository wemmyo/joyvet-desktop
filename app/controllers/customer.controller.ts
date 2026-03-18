import { toast } from 'sonner';
import { ICustomer } from '../models/customer';
import { IInvoice } from '../models/invoice';
import { IReceipt } from '../models/receipt';
import type {
  PaginatedResult,
  PaginationQuery,
  SearchPaginationQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptyCustomers = (
  query?: PaginationQuery
): PaginatedResult<ICustomer> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const getCustomersFn = async (
  query?: PaginationQuery
): Promise<PaginatedResult<ICustomer>> => {
  try {
    return await window.api.customer.getAll(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyCustomers(query);
  }
};

export const createCustomerFn = async (
  values: Partial<ICustomer>,
  cb?: () => void
) => {
  try {
    const user = getUserSession();
    const customer = await window.api.customer.create({
      ...values,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Successfully created');
    if (cb) cb();
    return customer;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const updateCustomerFn = async (
  values: Partial<ICustomer>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.customer.update(id, values);
    toast.success('Successfully updated, refresh to see changes');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deleteCustomerFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.customer.delete(id);
    toast.success('Successfully deleted');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSingleCustomerFn = async (id: number, cb?: () => void) => {
  try {
    const customer = await window.api.customer.getById(id);
    if (cb) cb();
    return customer;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const searchCustomerFn = async (
  query: SearchPaginationQuery
): Promise<PaginatedResult<ICustomer>> => {
  try {
    return await window.api.customer.search(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyCustomers(query);
  }
};

export const getCustomerInvoicesFn = async (
  customerId: number,
  startDate: string,
  endDate: string
): Promise<IInvoice[]> => {
  try {
    return await window.api.customer.getInvoices(
      customerId,
      startDate,
      endDate
    );
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const getCustomerActivityTimelineFn = async (
  customerId: number,
  startDate: string,
  endDate: string
): Promise<any[]> => {
  try {
    return await window.api.customer.getActivityTimeline(
      customerId,
      startDate,
      endDate
    );
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const getCustomerReceiptsFn = async (
  customerId: number,
  startDate?: string,
  endDate?: string
): Promise<IReceipt[]> => {
  try {
    return await window.api.customer.getReceipts(
      customerId,
      startDate,
      endDate
    );
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};
