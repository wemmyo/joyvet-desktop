import { toast } from 'sonner';
import { IUser } from '../models/user';

export const loginUserFn = async (
  values: { username: string; password: string },
  cb?: () => void
) => {
  try {
    const user = await window.api.user.login(values);
    localStorage.setItem('user', JSON.stringify(user));
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const logoutFn = () => {
  localStorage.removeItem('user');
};

export const getUsersFn = async () => {
  try {
    return await window.api.user.getAll();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const getSingleUserFn = async (id: number, cb?: () => void) => {
  try {
    const user = await window.api.user.getById(id);
    if (cb) cb();
    return user;
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const createUserFn = async (values: any, cb?: () => void) => {
  try {
    await window.api.user.create(values);
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const updateUserFn = async (
  values: Partial<IUser>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.user.update(id, values);
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};

export const deleteUserFn = async (userId: number, cb?: () => void) => {
  try {
    await window.api.user.delete(userId);
    toast.success('User successfully deleted');
    if (cb) cb();
  } catch (error: any) {
    toast.error(error.message || '');
  }
};
