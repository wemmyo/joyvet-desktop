import { toast } from 'react-toastify';

export const searchReceiptFn = async (value: string) => {
  try {
    return await window.api.receipt.search(value);
  } catch (error: any) {
    toast.error(error.message || '');
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
  }
};

export const getReceiptsFn = async () => {
  try {
    return await window.api.receipt.getAll();
  } catch (error: any) {
    toast.error(error.message || '');
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
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await window.api.receipt.create({ ...values, postedBy: user.fullName });
    toast.success('Receipt successfully created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
