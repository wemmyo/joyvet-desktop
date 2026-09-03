vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  user: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    login: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import { getUserSession } from '../../utils/session';
import {
  createUserFn,
  deleteUserFn,
  getUsersFn,
  loginUserFn,
} from '../user.controller';

const mockUser = {
  id: 1,
  fullName: 'Admin User',
  username: 'admin',
  password: 'hashedPassword',
  role: 'admin',
};

describe('user controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('loginUserFn', () => {
    it('logs in successfully and stores a sanitized session', async () => {
      mockApi.user.login.mockResolvedValue(mockUser);
      const cb = vi.fn();
      await loginUserFn({ username: 'admin', password: 'admin' }, cb);
      expect(getUserSession()).toEqual({
        id: 1,
        fullName: 'Admin User',
        role: 'admin',
      });
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error when login fails', async () => {
      mockApi.user.login.mockRejectedValue(
        new Error('A user with this username could not be found')
      );
      await loginUserFn({ username: 'nobody', password: 'pass' });
      expect(toast.error).toHaveBeenCalled();
      expect(getUserSession()).toBeNull();
    });

    it('calls toast.error when password is invalid', async () => {
      mockApi.user.login.mockRejectedValue(new Error('Invalid password'));
      await loginUserFn({ username: 'admin', password: 'wrong' });
      expect(toast.error).toHaveBeenCalledWith('Invalid password');
      expect(getUserSession()).toBeNull();
    });
  });

  describe('getUsersFn', () => {
    it('returns users', async () => {
      mockApi.user.getAll.mockResolvedValue({
        rows: [mockUser],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const result = await getUsersFn();
      expect(result).toEqual({
        rows: [mockUser],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });
  });

  describe('createUserFn', () => {
    it('creates a user via IPC and calls cb', async () => {
      mockApi.user.create.mockResolvedValue(undefined);
      const cb = vi.fn();
      const result = await createUserFn(
        {
          fullName: 'New User',
          username: 'newuser',
          password: 'pass123',
          role: 'cashier',
        },
        cb
      );
      expect(mockApi.user.create).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('deleteUserFn', () => {
    it('deletes user and shows success toast', async () => {
      mockApi.user.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteUserFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('User successfully deleted');
      expect(cb).toHaveBeenCalled();
    });
  });
});
