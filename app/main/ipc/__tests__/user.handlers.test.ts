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

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashedPassword'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('hashedPassword'),
  compare: vi.fn().mockResolvedValue(true),
}));

import * as userService from '../../../services/user.service';
import bcrypt from 'bcryptjs';
import { registerUserHandlers } from '../user.handlers';

const mockEvent = {} as any;

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
    role: 'admin',
  }),
};

describe('user IPC handlers', () => {
  beforeAll(() => {
    registerUserHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default mock behaviour after clearAllMocks resets return values
    (bcrypt.hash as any).mockResolvedValue('hashedPassword');
    (bcrypt.compare as any).mockResolvedValue(true);
  });

  // ------------------------------------------------------------------ login
  describe('user:login', () => {
    it('logs in successfully and returns serialized user', async () => {
      (userService.findOneUser as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      const result = await handlers['user:login'](mockEvent, {
        username: 'admin',
        password: 'admin123',
      });
      expect(result).toEqual(mockUser.toJSON());
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
      (bcrypt.compare as any).mockResolvedValue(false);
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
    it('returns all users serialized', async () => {
      (userService.getUsers as any).mockResolvedValue([mockUser]);
      const result = await handlers['user:getAll'](mockEvent);
      expect(result).toEqual([mockUser.toJSON()]);
    });

    it('throws on service error', async () => {
      (userService.getUsers as any).mockRejectedValue(new Error('DB error'));
      await expect(handlers['user:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getById
  describe('user:getById', () => {
    it('returns single user serialized', async () => {
      (userService.getUserById as any).mockResolvedValue(mockUser);
      const result = await handlers['user:getById'](mockEvent, 1);
      expect(result).toEqual(mockUser.toJSON());
    });
  });

  // ------------------------------------------------------------------ create
  describe('user:create', () => {
    it('creates user with hashed password', async () => {
      (userService.createUser as any).mockResolvedValue(mockUser);
      (bcrypt.hash as any).mockResolvedValue('hashedPassword');
      await handlers['user:create'](mockEvent, {
        fullName: 'New User',
        username: 'newuser',
        password: 'pass123',
        role: 'cashier',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 12);
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashedPassword' })
      );
    });

    it('does not store the plain-text password', async () => {
      (userService.createUser as any).mockResolvedValue(mockUser);
      (bcrypt.hash as any).mockResolvedValue('hashedPassword');
      await handlers['user:create'](mockEvent, {
        fullName: 'New User',
        username: 'newuser',
        password: 'plain123',
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
    it('deletes a user when found', async () => {
      const mockDestroyUser = {
        ...mockUser,
        destroy: vi.fn().mockResolvedValue(undefined),
      };
      (userService.deleteUser as any).mockResolvedValue(mockDestroyUser);
      await handlers['user:delete'](mockEvent, 1);
      expect(userService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockDestroyUser.destroy).toHaveBeenCalled();
    });

    it('does not call destroy when user is not found', async () => {
      (userService.deleteUser as any).mockResolvedValue(null);
      await handlers['user:delete'](mockEvent, 999);
      expect(userService.deleteUser).toHaveBeenCalledWith(999);
      // No error should be thrown
    });
  });
});
