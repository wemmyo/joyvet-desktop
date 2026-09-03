import { toast } from 'sonner';
import type { IReceipt } from '../models/receipt';
import type {
  PaginatedResult,
  PaginationQuery,
  SearchPaginationQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptyReceipts = (query?: PaginationQuery): PaginatedResult<IReceipt> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const searchReceiptFn = async (query: SearchPaginationQuery) => {
  try {
    return await window.api.receipt.search(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return emptyReceipts(query);
  }
};

export const updateReceiptFn =
  (values: Partial<IReceipt>, id: number | string, cb?: () => void) =>
  async () => {
    try {
      await window.api.receipt.update(id as number, values);
      toast.success('Successfully updated');
      if (cb) cb();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '');
    }
  };

export const getSingleReceiptFn = async (
  id: number | string,
  cb?: () => void
) => {
  try {
    const receipt = await window.api.receipt.getById(id as number);
    if (cb) cb();
    return receipt;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return null;
  }
};

export const getReceiptsFn = async (query?: PaginationQuery) => {
  try {
    return await window.api.receipt.getAll(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return emptyReceipts(query);
  }
};

export const deleteReceiptFn = async (
  id: number | string,
  cb?: () => void
) => {
  try {
    await window.api.receipt.delete(id as number);
    toast.success('Receipt successfully deleted');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};

export const createReceiptFn = async (
  values: Partial<IReceipt>,
  cb?: () => void
) => {
  try {
    const user = getUserSession();
    await window.api.receipt.create({
      ...values,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Receipt successfully created');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};
