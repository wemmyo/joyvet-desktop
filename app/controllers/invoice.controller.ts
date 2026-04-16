import { toast } from 'sonner';
import type { IInvoice } from '../models/invoice';
import type { IInvoiceItem } from '../models/invoiceItem';
import type {
  InvoiceListQuery,
  PaginatedResult,
  PaginationQuery,
} from '../types/pagination';
import { getUserSession } from '../utils/session';

const emptyPaginatedInvoices = (
  query?: PaginationQuery
): PaginatedResult<IInvoice> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const getInvoicesFn = async (
  query?: PaginationQuery
): Promise<PaginatedResult<IInvoice>> => {
  try {
    return await window.api.invoice.getAll(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return emptyPaginatedInvoices(query);
  }
};

export const filterInvoiceFn = async (query: InvoiceListQuery) => {
  try {
    return await window.api.invoice.filter(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    throw error;
  }
};

export const filterInvoiceById = async (query: InvoiceListQuery) => {
  try {
    return await window.api.invoice.filterById(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    throw error;
  }
};

export const getSingleInvoiceFn = async (id: number, cb?: () => void) => {
  try {
    const invoice = await window.api.invoice.getSingle(id);
    if (cb) cb();
    return invoice;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return undefined;
  }
};

export const deleteInvoiceFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.invoice.delete(id);
    toast.success('Invoice deleted successfully.');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    throw error;
  }
};

export const deleteInvoiceItemFn = async ({
  productId,
  invoiceId,
  invoiceItemId,
  cb,
}: {
  productId: number;
  invoiceId: number;
  invoiceItemId: number;
  cb?: () => void;
}) => {
  try {
    await window.api.invoice.deleteItem({
      productId,
      invoiceId,
      invoiceItemId,
    });
    toast.success('Invoice item deleted successfully');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    throw error;
  }
};

export const addInvoiceItemFn = async (
  currentInvoice: IInvoice,
  currentInvoiceItem: Partial<IInvoiceItem>
) => {
  try {
    await window.api.invoice.addItem(currentInvoice, currentInvoiceItem);
    toast.success('Successfully updated item in the invoice');
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    throw error;
  }
};

export const updateInvoiceItemFn = async (args: {
  invoiceItemId: number;
  invoiceId: number;
  productId: number;
  newQuantity: number;
}) => {
  try {
    const user = getUserSession();
    await window.api.invoice.updateItem({
      ...args,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Item quantity updated');
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    throw error;
  }
};

export const createInvoiceFn = async (
  invoiceItems: Omit<IInvoiceItem, 'id' | 'createdAt' | 'updatedAt'>[],
  invoice?: Partial<IInvoice>,
  cb?: (id: number) => void | Promise<void>
) => {
  try {
    const user = getUserSession();
    const result = await window.api.invoice.create(invoiceItems, {
      ...invoice,
      postedBy: user?.fullName ?? '',
    });
    toast.success('Invoice created');
    if (cb && result?.id) await cb(result.id);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};
