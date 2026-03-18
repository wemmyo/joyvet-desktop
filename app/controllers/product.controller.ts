import { toast } from 'sonner';
import type { IProduct } from '../models/product';
import type {
  PaginatedResult,
  PaginationQuery,
  ProductListQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptyProducts = (
  query?: PaginationQuery
): PaginatedResult<IProduct> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const getProductsFn = async (
  query?: ProductListQuery
): Promise<PaginatedResult<IProduct>> => {
  try {
    return await window.api.product.getAll(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyProducts(query);
  }
};

export const createProductFn = async (
  values: Partial<IProduct>,
  cb?: () => void
) => {
  try {
    const user = getUserSession();
    await window.api.product.create({
      ...values,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Successfully created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const updateProductFn = async (
  values: Partial<IProduct>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.product.update(id, values);
    toast.success('Successfully updated');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSingleProductFn = async (id: number, cb?: () => void) => {
  try {
    const product = await window.api.product.getById(id);
    if (cb) cb();
    return product;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deleteProductFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.product.delete(id);
    toast.success('Successfully deleted');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const searchProductFn = async (
  query: ProductListQuery
): Promise<PaginatedResult<IProduct>> => {
  try {
    return await window.api.product.search(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyProducts(query);
  }
};

export const getProductInvoicesFn = async (
  productId: number,
  startDate: string,
  endDate: string
) => {
  try {
    return await window.api.product.getInvoices(productId, startDate, endDate);
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const getProductPurchasesFn = async (
  productId: number,
  startDate?: Date | string,
  endDate?: Date | string
) => {
  try {
    return await window.api.product.getPurchases(
      productId,
      startDate as string,
      endDate as string
    );
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const getProductAuditLogFn = async (
  productId: number,
  startDate: string,
  endDate: string
) => {
  try {
    return await window.api.product.getAuditLog(productId, startDate, endDate);
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};
