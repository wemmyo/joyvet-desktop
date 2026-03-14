import { toast } from 'sonner';
import { IInvoice } from '../models/invoice';
import { IInvoiceItem } from '../models/invoiceItem';

export const getInvoicesFn = async () => {
  try {
    const invoices = await window.api.invoice.getAll();
    return invoices;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const filterInvoiceFn = async (
  startDate: string,
  endDate: string,
  saleType: string
) => {
  try {
    const invoices = await window.api.invoice.filter(
      startDate,
      endDate,
      saleType
    );
    return invoices;
  } catch (error: any) {
    toast.error(error.message || '');
    throw error;
  }
};

export const filterInvoiceById = async (id: number) => {
  try {
    const invoices = await window.api.invoice.filterById(id);
    return invoices;
  } catch (error: any) {
    toast.error(error.message || '');
    throw error;
  }
};

export const getSingleInvoiceFn = async (id: number, cb?: () => void) => {
  try {
    const invoice = await window.api.invoice.getSingle(id);
    if (cb) cb();
    return invoice;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deleteInvoiceFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.invoice.delete(id);
    toast.success('Invoice deleted successfully.');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
    throw error;
  }
};

export const deleteInvoiceItemFn = async ({
  productId,
  invoiceId,
  invoiceItemId,
  cb,
}: any) => {
  try {
    await window.api.invoice.deleteItem({
      productId,
      invoiceId,
      invoiceItemId,
    });
    toast.success('Invoice item deleted successfully');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
    throw error;
  }
};

export const addInvoiceItemFn = async (
  currentInvoice: any,
  currentInvoiceItem: any
) => {
  try {
    await window.api.invoice.addItem(currentInvoice, currentInvoiceItem);
    toast.success('Successfully updated item in the invoice');
  } catch (error: any) {
    toast.error(error.message || '');
    throw error;
  }
};

export const createInvoiceFn = async (
  invoiceItems: Omit<IInvoiceItem, 'id' | 'createdAt' | 'updatedAt'>[],
  invoice?: Partial<IInvoice>,
  cb?: (id: number) => void
) => {
  try {
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    const result = await window.api.invoice.create(invoiceItems, {
      ...invoice,
      postedBy: user.fullName,
    });
    toast.success('Invoice created');
    if (cb && result?.id) cb(result.id);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
