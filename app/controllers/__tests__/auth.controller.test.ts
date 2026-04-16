vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  auth: {
    getBootstrapStatus: vi.fn(),
    createInitialAdmin: vi.fn(),
  },
};

Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import { createInitialAdminFn, getBootstrapStatusFn } from '../auth.controller';
import { getUserSession } from '../../utils/session';

describe('auth controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('returns the bootstrap status from IPC', async () => {
    mockApi.auth.getBootstrapStatus.mockResolvedValue({ hasUsers: false });

    await expect(getBootstrapStatusFn()).resolves.toEqual({ hasUsers: false });
  });

  it('creates the initial admin and stores a sanitized session', async () => {
    mockApi.auth.createInitialAdmin.mockResolvedValue({
      id: 1,
      fullName: 'Admin User',
      role: 'admin',
    });

    await expect(
      createInitialAdminFn({
        fullName: 'Admin User',
        username: 'admin',
        password: 'secure-password',
      })
    ).resolves.toEqual({
      id: 1,
      fullName: 'Admin User',
      role: 'admin',
    });

    expect(getUserSession()).toEqual({
      id: 1,
      fullName: 'Admin User',
      role: 'admin',
    });
  });

  it('surfaces errors when initial admin creation fails', async () => {
    mockApi.auth.createInitialAdmin.mockRejectedValue(
      new Error('Initial admin has already been configured')
    );

    await expect(
      createInitialAdminFn({
        fullName: 'Admin User',
        username: 'admin',
        password: 'secure-password',
      })
    ).resolves.toBeNull();

    expect(toast.error).toHaveBeenCalledWith(
      'Initial admin has already been configured'
    );
  });
});
