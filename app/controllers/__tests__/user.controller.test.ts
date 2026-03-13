jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockApi = {
  user: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    login: jest.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'react-toastify';
import {
  loginUserFn,
  getUsersFn,
  createUserFn,
  deleteUserFn,
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
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('loginUserFn', () => {
    it('logs in successfully and stores user in localStorage', async () => {
      mockApi.user.login.mockResolvedValue(mockUser);
      const cb = jest.fn();
      await loginUserFn({ username: 'admin', password: 'admin' }, cb);
      expect(localStorage.getItem('user')).toBeTruthy();
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error when login fails', async () => {
      mockApi.user.login.mockRejectedValue(new Error('A user with this username could not be found'));
      await loginUserFn({ username: 'nobody', password: 'pass' });
      expect(toast.error).toHaveBeenCalled();
    });

    it('calls toast.error when password is invalid', async () => {
      mockApi.user.login.mockRejectedValue(new Error('Invalid password'));
      await loginUserFn({ username: 'admin', password: 'wrong' });
      expect(toast.error).toHaveBeenCalledWith('Invalid password');
    });
  });

  describe('getUsersFn', () => {
    it('returns users', async () => {
      mockApi.user.getAll.mockResolvedValue([mockUser]);
      const result = await getUsersFn();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('createUserFn', () => {
    it('creates a user via IPC and calls cb', async () => {
      mockApi.user.create.mockResolvedValue(undefined);
      const cb = jest.fn();
      await createUserFn({ fullName: 'New User', username: 'newuser', password: 'pass123', role: 'cashier' }, cb);
      expect(mockApi.user.create).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('deleteUserFn', () => {
    it('deletes user and shows success toast', async () => {
      mockApi.user.delete.mockResolvedValue(undefined);
      const cb = jest.fn();
      await deleteUserFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('User successfully deleted');
      expect(cb).toHaveBeenCalled();
    });
  });
});
