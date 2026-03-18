import { toast } from 'sonner';
import { IUser } from '../models/user';
import { sanitizeUserSession, type UserSession } from '../types/session';
import type {
  PaginatedResult,
  PaginationQuery,
} from '../types/pagination';
import { clearUserSession, setUserSession } from '../utils/session';

export const loginUserFn = async (
  values: { username: string; password: string },
  cb?: () => void
): Promise<UserSession | null> => {
  try {
    const user = await window.api.user.login(values);
    const session = sanitizeUserSession(user);

    if (!session) {
      throw new Error('Invalid user session');
    }

    setUserSession(session);
    if (cb) cb();
    return session;
  } catch (error: any) {
    toast.error(error.message || '');
    return null;
  }
};

export const logoutFn = () => {
  clearUserSession();
};

const emptyUsers = (query?: PaginationQuery): PaginatedResult<IUser> => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25,
});

export const getUsersFn = async (
  query?: PaginationQuery
): Promise<PaginatedResult<IUser>> => {
  try {
    return await window.api.user.getAll(query);
  } catch (error: any) {
    toast.error(error.message || '');
    return emptyUsers(query);
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
