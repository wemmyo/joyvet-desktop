import { toast } from 'sonner';
import { IStoreInfo } from '../models/storeInfo';

export const getStoreInfoFn = async () => {
  try {
    return await window.api.storeInfo.getAll();
  } catch (error: any) {
    toast.error(error.message || '');
    return [];
  }
};

export const getSingleStoreInfoFn = async (id: number, cb?: () => void) => {
  try {
    const response = await window.api.storeInfo.getById(id);
    if (cb) cb();
    return response;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deleteStoreInfoFn = async (id: number, cb?: () => void) => {
  try {
    await window.api.storeInfo.delete(id);
    toast.success('Store Info successfully deleted');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createStoreInfoFn = async (
  values: Partial<IStoreInfo>,
  cb?: () => void
) => {
  try {
    await window.api.storeInfo.create(values);
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const updateStoreInfoFn = async (
  values: Partial<IStoreInfo>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.storeInfo.update(id, values);
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
