import { toast } from 'sonner';
import { IPayment } from '../models/payment';

export const searchPaymentFn = async (value: string) => {
  try {
    return await window.api.payment.search(value);
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const updatePaymentFn = async (
  values: Partial<IPayment>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.payment.update(id, values);
    toast.success('Successfully updated');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSinglePaymentFn = async (id: number, cb?: () => void) => {
  try {
    const payment = await window.api.payment.getById(id);
    if (cb) cb();
    return payment;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getPaymentsFn = async () => {
  try {
    return await window.api.payment.getAll();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deletePaymentFn = async (id: string | number) => {
  try {
    await window.api.payment.delete(id as number);
    toast.success('Payment successfully deleted');
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createPaymentFn = async (values: any, cb?: () => void) => {
  try {
    const user =
      localStorage.getItem('user') !== null
        ? JSON.parse(localStorage.getItem('user') || '')
        : '';
    await window.api.payment.create({ ...values, postedBy: user.fullName });
    toast.success('Payment successfully created');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
