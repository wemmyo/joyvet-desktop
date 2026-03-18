const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
  },
}));

vi.mock('../../../models/user', () => ({
  default: {
    count: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../bootstrap', () => ({
  hasUsers: vi.fn(),
  createInitialAdmin: vi.fn(),
}));

vi.mock('../../runtime', () => ({
  ensureAuthReady: vi.fn(),
}));

import User from '../../../models/user';
import * as bootstrap from '../../bootstrap';
import { ensureAuthReady } from '../../runtime';
import { registerAuthHandlers } from '../auth.handlers';

const mockEvent = {} as any;

describe('auth IPC handlers', () => {
  beforeAll(() => {
    registerAuthHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (ensureAuthReady as any).mockResolvedValue({ User });
  });

  it('returns the bootstrap status', async () => {
    (bootstrap.hasUsers as any).mockResolvedValue(false);

    await expect(
      handlers['auth:getBootstrapStatus'](mockEvent)
    ).resolves.toEqual({ hasUsers: false });

    expect(bootstrap.hasUsers).toHaveBeenCalledWith(User);
  });

  it('creates the initial admin and returns a sanitized session', async () => {
    (bootstrap.createInitialAdmin as any).mockResolvedValue({
      toJSON: () => ({
        id: 1,
        fullName: 'Admin User',
        username: 'admin',
        password: 'hashedPassword',
        role: 'admin',
      }),
    });

    await expect(
      handlers['auth:createInitialAdmin'](mockEvent, {
        fullName: 'Admin User',
        username: 'admin',
        password: 'secure-password',
      })
    ).resolves.toEqual({
      id: 1,
      fullName: 'Admin User',
      role: 'admin',
    });
  });

  it('rejects invalid initial admin payloads', async () => {
    await expect(
      handlers['auth:createInitialAdmin'](mockEvent, {
        fullName: 'Ad',
        username: 'ad',
        password: 'pw',
      })
    ).rejects.toThrow();
  });
});
