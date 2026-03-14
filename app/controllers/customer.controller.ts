import { toast } from 'sonner';
import { ICustomer } from '../models/customer';
import { IInvoice } from '../models/invoice';
import { IReceipt } from '../models/receipt';

export const getCustomersFn = async () => {
  try {
    return await window.api.customer.getAll();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createCustomerFn = async (
  values: Partial<ICustomer>,
  cb?: () => void
) => {
  try {
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    const customer = await window.api.customer.create({
      ...values,
      postedBy: user.fullName,
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

export const searchCustomerFn = async (value: string) => {
  try {
    return await window.api.customer.search(value);
  } catch (error: any) {
    toast.error(error.message || '');
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
