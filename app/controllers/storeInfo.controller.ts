import { toast } from 'react-toastify';
import { z } from 'zod';
import { IStoreInfo } from '../models/storeInfo';
import {
  getStoreInfos,
  getStoreInfoById,
  deleteStoreInfo,
  createStoreInfo,
  updateStoreInfo,
} from '../services/storeInfo.service';

export const getStoreInfoFn = async () => {
  try {
    const storeInfo = await getStoreInfos();
    return storeInfo;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleStoreInfoFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const GetSingleStoreInfoSchema = z.object({
    id: z.number(),
  });

  try {
    GetSingleStoreInfoSchema.parse({ id });

    const getSingleStoreInfoResponse = await getStoreInfoById(id);

    if (cb) {
      cb();
    }

    return getSingleStoreInfoResponse;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteStoreInfoFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const DeleteStoreInfoSchema = z.object({
    id: z.string().min(3).max(255),
  });

  try {
    DeleteStoreInfoSchema.parse({ id });
    const storeInfo = await deleteStoreInfo(id);
    storeInfo.destroy();
    toast.success('Store Info successfully deleted');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createStoreInfoFn = async (
  values: Partial<IStoreInfo>,
  cb?: () => void
) => {
  // use zod to validate input
  const CreateStoreInfoSchema = z.object({
    storeName: z.string().min(3).max(255),
    address: z.string().min(3).max(255),
    phoneNumber: z.string().min(3).max(255),
  });

  try {
    CreateStoreInfoSchema.parse(values);
    await createStoreInfo(values);

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const updateStoreInfoFn = async (
  values: Partial<IStoreInfo>,
  id: number,
  cb?: () => void
) => {
  // use zod to validate input
  const UpdateStoreInfoSchema = z.object({
    id: z.number(),
    storeName: z.string().min(3).max(255),
    address: z.string().min(3).max(255),
    phoneNumber: z.string().min(3).max(255),
  });

  try {
    UpdateStoreInfoSchema.parse({ id, ...values });
    await updateStoreInfo(id, values);

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
