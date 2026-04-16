import { toast } from 'sonner';
import type { ICustomer } from '../models/customer';
import type { IInvoice } from '../models/invoice';
import type { IReceipt } from '../models/receipt';
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return undefined;
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};

export const deleteCustomerFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.customer.delete(id);
    toast.success('Successfully deleted');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};

export const getSingleCustomerFn = async (id: number, cb?: () => void) => {
  try {
    const customer = await window.api.customer.getById(id);
    if (cb) cb();
    return customer;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return undefined;
  }
};

export const searchCustomerFn = async (
  query: SearchPaginationQuery
): Promise<PaginatedResult<ICustomer>> => {
  try {
    return await window.api.customer.search(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};
