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
    findByPk: vi.fn(),
    count: vi.fn(),
    destroy: vi.fn(),
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
        rows: [
          { id: 1, fullName: 'Admin User', username: 'admin', role: 'admin' },
        ],
        total: 1,
        page: 1,
        pageSize: 50,
      });
      expect(result.rows[0]).not.toHaveProperty('password');
    });

    it('throws on db error', async () => {
      (UserModel.findAndCountAll as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['user:getAll'](mockEvent, {})).rejects.toThrow(
        'DB error'
      );
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
        role: 'staff',
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
        role: 'staff',
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
          role: 'staff',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when username is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:create'](mockEvent, {
          fullName: 'Valid Name',
          username: 'ab',
          password: 'validpass',
          role: 'staff',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when password is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:create'](mockEvent, {
          fullName: 'Valid Name',
          username: 'validuser',
          password: 'ab',
          role: 'staff',
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
      (UserModel.findByPk as any).mockResolvedValue(null);
      (UserModel.destroy as any).mockResolvedValue(1);
      await handlers['user:delete'](mockEvent, 1);
      expect(UserModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });

    it('does not throw when no row is deleted', async () => {
      (UserModel.findByPk as any).mockResolvedValue(null);
      (UserModel.destroy as any).mockResolvedValue(0);
      await handlers['user:delete'](mockEvent, 999);
      expect(UserModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 999 } })
      );
    });

    it('throws when deleting the last admin', async () => {
      const adminUser = { id: 1, role: 'admin' };
      (UserModel.findByPk as any).mockResolvedValue(adminUser);
      (UserModel.count as any).mockResolvedValue(1);
      await expect(handlers['user:delete'](mockEvent, 1)).rejects.toThrow(
        'Cannot delete the last admin account'
      );
      expect(UserModel.destroy).not.toHaveBeenCalled();
    });

    it('succeeds when deleting an admin with other admins', async () => {
      const adminUser = { id: 1, role: 'admin' };
      (UserModel.findByPk as any).mockResolvedValue(adminUser);
      (UserModel.count as any).mockResolvedValue(2);
      (UserModel.destroy as any).mockResolvedValue(1);
      await handlers['user:delete'](mockEvent, 1);
      expect(UserModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });

    it('succeeds when deleting a non-admin user', async () => {
      const staffUser = { id: 2, role: 'staff' };
      (UserModel.findByPk as any).mockResolvedValue(staffUser);
      (UserModel.destroy as any).mockResolvedValue(1);
      await handlers['user:delete'](mockEvent, 2);
      expect(UserModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 2 } })
      );
      expect(UserModel.count).not.toHaveBeenCalled();
    });

    it('succeeds when user does not exist', async () => {
      (UserModel.findByPk as any).mockResolvedValue(null);
      (UserModel.destroy as any).mockResolvedValue(0);
      await handlers['user:delete'](mockEvent, 999);
      expect(UserModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 999 } })
      );
    });
  });
});
