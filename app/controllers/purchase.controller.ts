import { toast } from 'sonner';
import type { IPurchase } from '../models/purchase';
import type { IPurchaseItem } from '../models/purchaseItem';
import type {
  PaginatedResult,
  PaginationQuery,
  SearchPaginationQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptyPurchases = (
  query?: PaginationQuery
): PaginatedResult<IPurchase> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const searchPurchaseFn = async (
  query: SearchPaginationQuery
): Promise<PaginatedResult<IPurchase>> => {
  try {
    return await window.api.purchase.search(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return emptyPurchases(query);
  }
};

export const getSinglePurchaseFn = async (id: number, cb?: () => void) => {
  try {
    const purchase = await window.api.purchase.getById(id);
    if (cb) cb();
    return purchase;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return undefined;
  }
};

export const getPurchasesFn = async (
  query?: PaginationQuery
): Promise<PaginatedResult<IPurchase>> => {
  try {
    return await window.api.purchase.getAll(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return emptyPurchases(query);
  }
};

export const createPurchaseFn = async (
  values: IPurchaseItem[],
  meta: Omit<IPurchase, 'id' | 'postedBy'>,
  cb?: () => void
) => {
  try {
    const user = getUserSession();
    await window.api.purchase.create(values, {
      ...meta,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Purchase created');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};

export const updatePurchaseFn = async (
  id: number,
  purchaseItems: any[],
  meta: Omit<IPurchase, 'id' | 'postedBy' | 'supplierId'>,
  cb?: () => void
) => {
  try {
    const user = getUserSession();
    await window.api.purchase.update(id, purchaseItems, {
      ...meta,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Purchase updated');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    throw error;
  }
};

export const deletePurchaseFn = async (
  id: number | string,
  options?: { force?: boolean },
  cb?: () => void
) => {
  // On success we toast and run the callback. On failure the error propagates
  // (no toast here) so the caller can decide how to surface it — e.g. the
  // stock-revert guard rejection should offer an admin a force-delete dialog
  // rather than a dead-end error toast.
  await window.api.purchase.delete(id as number, options?.force);
  toast.success('Purchase deleted');
  if (cb) cb();
};
