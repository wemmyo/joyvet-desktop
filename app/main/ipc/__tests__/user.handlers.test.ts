const handlers: Record<string, Function> = {};

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: jest.fn(),
  },
  app: { getPath: () => '/tmp/test', quit: jest.fn() },
  dialog: {
    showOpenDialogSync: jest.fn(() => ['/tmp/test.db']),
    showSaveDialogSync: jest.fn(() => '/tmp/test.db'),
  },
}));

jest.mock('../../database', () => ({
  default: {
    transaction: jest.fn((cb: Function) => cb({})),
    sync: jest.fn(),
  },
}));

jest.mock('../../../services/user.service', () => ({
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  createUser: jest.fn(),
  findOneUser: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
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
    jest.clearAllMocks();
    // Restore default mock behaviour after clearAllMocks resets return values
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  // ------------------------------------------------------------------ login
  describe('user:login', () => {
    it('logs in successfully and returns serialized user', async () => {
      (userService.findOneUser as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await handlers['user:login'](mockEvent, {
        username: 'admin',
        password: 'admin123',
      });
      expect(result).toEqual(mockUser.toJSON());
    });

    it('throws when user is not found', async () => {
      (userService.findOneUser as jest.Mock).mockResolvedValue(null);
      await expect(
        handlers['user:login'](mockEvent, {
          username: 'nobody',
          password: 'pass123',
        })
      ).rejects.toThrow('A user with this username could not be found');
    });

    it('throws when password is invalid', async () => {
      (userService.findOneUser as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        handlers['user:login'](mockEvent, {
          username: 'admin',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid password');
    });

    it('throws on validation error when username is too short (< 3 chars)', async () => {
      await expect(
        handlers['user:login'](mockEvent, { username: 'ab', password: 'pass123' })
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
      (userService.getUsers as jest.Mock).mockResolvedValue([mockUser]);
      const result = await handlers['user:getAll'](mockEvent);
      expect(result).toEqual([mockUser.toJSON()]);
    });

    it('throws on service error', async () => {
      (userService.getUsers as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['user:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getById
  describe('user:getById', () => {
    it('returns single user serialized', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      const result = await handlers['user:getById'](mockEvent, 1);
      expect(result).toEqual(mockUser.toJSON());
    });
  });

  // ------------------------------------------------------------------ create
  describe('user:create', () => {
    it('creates user with hashed password', async () => {
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
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
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      await handlers['user:create'](mockEvent, {
        fullName: 'New User',
        username: 'newuser',
        password: 'plain123',
        role: 'cashier',
      });
      const callArg = (userService.createUser as jest.Mock).mock.calls[0][0];
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
      (userService.updateUser as jest.Mock).mockResolvedValue([1]);
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
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      (userService.deleteUser as jest.Mock).mockResolvedValue(mockDestroyUser);
      await handlers['user:delete'](mockEvent, 1);
      expect(userService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockDestroyUser.destroy).toHaveBeenCalled();
    });

    it('does not call destroy when user is not found', async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(null);
      await handlers['user:delete'](mockEvent, 999);
      expect(userService.deleteUser).toHaveBeenCalledWith(999);
      // No error should be thrown
    });
  });
});
