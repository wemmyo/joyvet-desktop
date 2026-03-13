import { toast } from 'react-toastify';
import { ISupplier } from '../models/supplier';

export const getSupplierPaymentsFn = async (
  supplierId: number,
  startDate?: string,
  endDate?: string
) => {
  try {
    return await window.api.supplier.getPayments(supplierId, startDate, endDate);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSupplierPurchasesFn = async (
  supplierId: number,
  startDate: string,
  endDate: string
) => {
  try {
    return await window.api.supplier.getPurchases(supplierId, startDate, endDate);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const searchSupplierFn = async (value: string) => {
  try {
    return await window.api.supplier.search(value);
  } catch (error: any) {
    toast.error(error.message || '');
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
      autoClose: 5000,
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
  }
};

export const getSuppliersFn = async () => {
  try {
    return await window.api.supplier.getAll();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createSupplierFn = async (
  values: Partial<ISupplier>,
  cb?: () => void
) => {
  try {
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await window.api.supplier.create({ ...values, postedBy: user.fullName });
    toast.success('Supplier successfully created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
