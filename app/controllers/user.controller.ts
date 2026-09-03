import { toast } from 'sonner';
import type { IUser } from '../models/user';
import type { PaginatedResult, PaginationQuery } from '../types/pagination';
import { type UserSession, sanitizeUserSession } from '../types/session';
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return null;
  }
};

export const logoutFn = async () => {
  await window.api.user.logout();
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
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return emptyUsers(query);
  }
};

export const getSingleUserFn = async (id: number, cb?: () => void) => {
  try {
    const user = await window.api.user.getById(id);
    if (cb) cb();
    return user;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return undefined;
  }
};

export const createUserFn = async (
  values: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>,
  cb?: () => void
) => {
  try {
    await window.api.user.create(values);
    toast.success('User created successfully');
    if (cb) cb();
    return true;
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return undefined;
  }
};

export const updateUserFn = async (
  values: Partial<IUser>,
  id: number,
  cb?: () => void
) => {
  try {
    await window.api.user.update(id, values);
    toast.success('User updated successfully');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};

export const deleteUserFn = async (userId: number, cb?: () => void) => {
  try {
    await window.api.user.delete(userId);
    toast.success('User successfully deleted');
    if (cb) cb();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
  }
};
