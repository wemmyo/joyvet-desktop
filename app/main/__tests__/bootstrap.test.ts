const { hashMock } = vi.hoisted(() => ({
  hashMock: vi.fn().mockResolvedValue('hashedPassword'),
}));

vi.mock('bcryptjs', () => ({
  hash: hashMock,
}));

import {
  createInitialAdmin,
  hasUsers,
  maybeSeedDevelopmentAdmin,
} from '../bootstrap';

const createUserModel = () => ({
  count: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
});

describe('main bootstrap helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hashMock.mockResolvedValue('hashedPassword');
  });

  it('reports whether any users exist', async () => {
    const UserModel = createUserModel();
    UserModel.count.mockResolvedValue(1);

    await expect(hasUsers(UserModel)).resolves.toBe(true);
  });

  it('does not seed the default admin outside development', async () => {
    const UserModel = createUserModel();

    await expect(maybeSeedDevelopmentAdmin(UserModel, false)).resolves.toBe(
      false
    );

    expect(hashMock).not.toHaveBeenCalled();
    expect(UserModel.findOne).not.toHaveBeenCalled();
    expect(UserModel.create).not.toHaveBeenCalled();
  });

  it('seeds a development admin when no admin exists and SEED_DEV_ADMIN=true', async () => {
    const UserModel = createUserModel();
    UserModel.findOne.mockResolvedValue(null);
    process.env.SEED_DEV_ADMIN = 'true';

    await expect(maybeSeedDevelopmentAdmin(UserModel, true)).resolves.toBe(
      true
    );

    expect(hashMock).toHaveBeenCalledWith('admin', 12);
    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'admin',
        role: 'admin',
        password: 'hashedPassword',
      })
    );

    delete process.env.SEED_DEV_ADMIN;
  });

  it('does not seed in development when SEED_DEV_ADMIN is not set', async () => {
    const UserModel = createUserModel();
    delete process.env.SEED_DEV_ADMIN;

    await expect(maybeSeedDevelopmentAdmin(UserModel, true)).resolves.toBe(
      false
    );

    expect(UserModel.findOne).not.toHaveBeenCalled();
    expect(UserModel.create).not.toHaveBeenCalled();
  });

  it('creates the initial admin only when the user table is empty', async () => {
    const UserModel = createUserModel();
    UserModel.count.mockResolvedValue(0);
    UserModel.create.mockResolvedValue({ id: 1 });

    await createInitialAdmin(UserModel, {
      fullName: 'Admin User',
      username: 'admin',
      password: 'secure-password',
    });

    expect(hashMock).toHaveBeenCalledWith('secure-password', 12);
    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Admin User',
        username: 'admin',
        role: 'admin',
        password: 'hashedPassword',
      })
    );
  });

  it('rejects initial admin creation when users already exist', async () => {
    const UserModel = createUserModel();
    UserModel.count.mockResolvedValue(1);

    await expect(
      createInitialAdmin(UserModel, {
        fullName: 'Admin User',
        username: 'admin',
        password: 'secure-password',
      })
    ).rejects.toThrow('Initial admin has already been configured');
  });
});
