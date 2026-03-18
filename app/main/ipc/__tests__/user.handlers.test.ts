const { hashMock, compareMock } = vi.hoisted(() => ({
  hashMock: vi.fn().mockResolvedValue('hashedPassword'),
  compareMock: vi.fn().mockResolvedValue(true),
}));

const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
  app: { getPath: () => '/tmp/test', quit: vi.fn() },
  dialog: {
    showOpenDialogSync: vi.fn(() => ['/tmp/test.db']),
    showSaveDialogSync: vi.fn(() => '/tmp/test.db'),
  },
}));

vi.mock('../../runtime', () => ({
  withAppReady: (fn: Function) => fn,
  ensureAuthReady: vi.fn(),
}));

vi.mock('../../database', () => ({
  default: {
    transaction: vi.fn((cb: Function) => cb({})),
    sync: vi.fn(),
  },
}));

vi.mock('../../../services/user.service', () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  createUser: vi.fn(),
  findOneUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('../../../models/user', () => ({
  default: {
    findAndCountAll: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: hashMock,
    compare: compareMock,
  },
  hash: hashMock,
  compare: compareMock,
}));

import UserModel from '../../../models/user';
import * as userService from '../../../services/user.service';
import { registerUserHandlers } from '../user.handlers';

const mockEvent = {} as any;
const expectedSession = {
  id: 1,
  fullName: 'Admin User',
  role: 'admin',
};

const mockUser = {
  id: 1,
  fullName: 'Admin User',
  username: 'admin',
  password: 'hashedPassword',
  role: 'admin',
  toJSON: () => ({
    id: 1,
    fullName: 'Admin User',
    username: 'admin',
    password: 'hashedPassword',
    role: 'admin',
  }),
};

describe('user IPC handlers', () => {
  beforeAll(() => {
    registerUserHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    hashMock.mockResolvedValue('hashedPassword');
    compareMock.mockResolvedValue(true);
  });

  // ------------------------------------------------------------------ login
  describe('user:login', () => {
    it('logs in successfully and returns serialized user', async () => {
      (userService.findOneUser as any).mockResolvedValue(mockUser);
      compareMock.mockResolvedValue(true);
      const result = await handlers['user:login'](mockEvent, {
        username: 'admin',
        password: 'admin123',
      });
      expect(result).toEqual(expectedSession);
      expect(result).not.toHaveProperty('password');
    });

    it('throws when user is not found', async () => {
      (userService.findOneUser as any).mockResolvedValue(null);
      await expect(
        handlers['user:login'](mockEvent, {
          username: 'nobody',
          password: 'pass123',
        })
      ).rejects.toThrow('A user with this username could not be found');
    });

    it('throws when password is invalid', async () => {
      (userService.findOneUser as any).mockResolvedValue(mockUser);
      compareMock.mockResolvedValue(false);
      await expect(
        handlers['user:login'](mockEvent, {
          username: 'admin',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid password');
    });

    it('throws on validation error when username is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:login'](mockEvent, {
          username: 'ab',
          password: 'pass123',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when password is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:login'](mockEvent, { username: 'admin', password: 'ab' })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ getAll
  describe('user:getAll', () => {
    it('returns paginated users without passwords', async () => {
      (UserModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockUser],
        count: 1,
      });
      const result = await handlers['user:getAll'](mockEvent, {});
      expect(result).toEqual({
        rows: [{ id: 1, fullName: 'Admin User', username: 'admin', role: 'admin' }],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      expect(result.rows[0]).not.toHaveProperty('password');
    });

    it('throws on db error', async () => {
      (UserModel.findAndCountAll as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(
        handlers['user:getAll'](mockEvent, {})
      ).rejects.toThrow('DB error');
    });
  });

  // --------------------------------------------------------------- getById
  describe('user:getById', () => {
    it('returns single user serialized', async () => {
      (userService.getUserById as any).mockResolvedValue(mockUser);
      const result = await handlers['user:getById'](mockEvent, 1);
      expect(result).toEqual({
        id: 1,
        fullName: 'Admin User',
        username: 'admin',
        role: 'admin',
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  // ------------------------------------------------------------------ create
  describe('user:create', () => {
    it('creates user with hashed password', async () => {
      (userService.createUser as any).mockResolvedValue(mockUser);
      hashMock.mockResolvedValue('hashedPassword');
      await handlers['user:create'](mockEvent, {
        fullName: 'New User',
        username: 'newuser',
        password: 'pass1234',
        role: 'cashier',
      });
      expect(hashMock).toHaveBeenCalledWith('pass1234', 12);
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashedPassword' })
      );
    });

    it('does not store the plain-text password', async () => {
      (userService.createUser as any).mockResolvedValue(mockUser);
      hashMock.mockResolvedValue('hashedPassword');
      await handlers['user:create'](mockEvent, {
        fullName: 'New User',
        username: 'newuser',
        password: 'plain1234',
        role: 'cashier',
      });
      const callArg = (userService.createUser as any).mock.calls[0][0];
      expect(callArg.password).not.toBe('plain123');
    });

    it('throws on validation error when fullName is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:create'](mockEvent, {
          fullName: 'ab',
          username: 'validuser',
          password: 'validpass',
          role: 'cashier',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when username is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:create'](mockEvent, {
          fullName: 'Valid Name',
          username: 'ab',
          password: 'validpass',
          role: 'cashier',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when password is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:create'](mockEvent, {
          fullName: 'Valid Name',
          username: 'validuser',
          password: 'ab',
          role: 'cashier',
        })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ update
  describe('user:update', () => {
    it('updates a user', async () => {
      (userService.updateUser as any).mockResolvedValue([1]);
      await handlers['user:update'](mockEvent, 1, { fullName: 'Updated Name' });
      expect(userService.updateUser).toHaveBeenCalledWith(1, {
        fullName: 'Updated Name',
      });
    });
  });

  // ------------------------------------------------------------------ delete
  describe('user:delete', () => {
    it('deletes a user by id', async () => {
      (userService.deleteUser as any).mockResolvedValue(1);
      await handlers['user:delete'](mockEvent, 1);
      expect(userService.deleteUser).toHaveBeenCalledWith(1);
    });

    it('does not throw when no row is deleted', async () => {
      (userService.deleteUser as any).mockResolvedValue(0);
      await handlers['user:delete'](mockEvent, 999);
      expect(userService.deleteUser).toHaveBeenCalledWith(999);
    });
  });
});
