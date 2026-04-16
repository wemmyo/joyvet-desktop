import { toast } from 'sonner';
import type {
  PaginatedResult,
  PaginationQuery,
  SearchPaginationQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptyReceipts = (query?: PaginationQuery): PaginatedResult<any> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const searchReceiptFn = async (query: SearchPaginationQuery) => {
  try {
    return await window.api.receipt.search(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyReceipts(query);
  }
};

export const updateReceiptFn =
  (values: any, id: string | number, cb?: () => void) => async () => {
    try {
      await window.api.receipt.update(id as number, values);
      toast.success('Successfully updated');
      if (cb) cb();
    } catch (error: any) {
      toast.error(error.message || '');
    }
  };

export const getSingleReceiptFn = async (
  id: string | number,
  cb?: () => void
) => {
  try {
    const receipt = await window.api.receipt.getById(id as number);
    if (cb) cb();
    return receipt;
  } catch (error: any) {
    toast.error(error.message || '');
    return null;
  }
};

export const getReceiptsFn = async (query?: PaginationQuery) => {
  try {
    return await window.api.receipt.getAll(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyReceipts(query);
  }
};

export const deleteReceiptFn = async (id: string | number) => {
  try {
    await window.api.receipt.delete(id as number);
    toast.success('Receipt successfully deleted');
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createReceiptFn = async (values: any, cb?: () => void) => {
  try {
    const user = getUserSession();
    await window.api.receipt.create({
      ...values,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Receipt successfully created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
