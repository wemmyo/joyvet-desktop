import { toast } from 'sonner';
import { IPurchase } from '../models/purchase';
import { IPurchaseItem } from '../models/purchaseItem';

export const searchPurchaseFn = async (value: string) => {
  try {
    return await window.api.purchase.search(value);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSinglePurchaseFn = async (id: number, cb?: () => void) => {
  try {
    const purchase = await window.api.purchase.getById(id);
    if (cb) cb();
    return purchase;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getPurchasesFn = async () => {
  try {
    return await window.api.purchase.getAll();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createPurchaseFn = async (
  values: IPurchaseItem[],
  meta: Omit<IPurchase, 'id' | 'postedBy'>,
  cb?: () => void
) => {
  try {
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await window.api.purchase.create(values, {
      ...meta,
      postedBy: user.fullName,
    });
    toast.success('Purchase created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deletePurchaseFn = async (
  id: string | number,
  cb?: () => void
) => {
  try {
    await window.api.purchase.delete(id as number);
    toast.success('Purchase deleted');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
