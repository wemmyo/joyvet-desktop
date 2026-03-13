import { toast } from 'react-toastify';
import type { IProduct } from '../models/product';

export const getProductsFn = async (filter?: 'inStock') => {
  try {
    return await window.api.product.getAll(filter);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createProductFn = async (
  values: Partial<IProduct>,
  cb?: () => void
) => {
  try {
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await window.api.product.create({ ...values, postedBy: user.fullName });
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

export const searchProductFn = async (value: string) => {
  try {
    return await window.api.product.search(value);
  } catch (error: any) {
    toast.error(error.message || '');
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
  }
};
