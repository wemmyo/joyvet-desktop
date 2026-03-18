import { toast } from 'sonner';
import { ISupplier } from '../models/supplier';
import type {
  PaginatedResult,
  PaginationQuery,
  SearchPaginationQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptySuppliers = (
  query?: PaginationQuery
): PaginatedResult<ISupplier> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const getSupplierActivityTimelineFn = async (
  supplierId: number,
  startDate: string,
  endDate: string
): Promise<any[]> => {
  try {
    return await window.api.supplier.getActivityTimeline(
      supplierId,
      startDate,
      endDate
    );
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const getSupplierPaymentsFn = async (
  supplierId: number,
  startDate?: string,
  endDate?: string
) => {
  try {
    return await window.api.payment.getBySupplier(
      supplierId,
      startDate || '',
      endDate || ''
    );
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const getSupplierPurchasesFn = async (
  supplierId: number,
  startDate: string,
  endDate: string
) => {
  try {
    return await window.api.purchase.getBySupplier(
      supplierId,
      startDate,
      endDate
    );
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const searchSupplierFn = async (
  query: SearchPaginationQuery
): Promise<PaginatedResult<ISupplier>> => {
  try {
    return await window.api.supplier.search(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptySuppliers(query);
  }
};

export const deleteSupplierFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.supplier.delete(id);
    toast.success('Successfully deleted');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const updateSupplierFn = async (
  values: any,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.supplier.update(id, values);
    toast.success('Successfully updated, refresh to see changes', {
      duration: 5000,
    });
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSingleSupplierFn = async (id: number) => {
  try {
    return await window.api.supplier.getById(id);
  } catch (error: any) {
    toast.error(error.message || '');
    return null;
  }
};

export const getSuppliersFn = async (
  query?: PaginationQuery
): Promise<PaginatedResult<ISupplier>> => {
  try {
    return await window.api.supplier.getAll(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptySuppliers(query);
  }
};

export const createSupplierFn = async (
  values: Partial<ISupplier>,
  cb?: () => void
) => {
  try {
    const user = getUserSession();
    await window.api.supplier.create({
      ...values,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Supplier successfully created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
