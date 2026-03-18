import { hash } from 'bcryptjs';

export interface InitialAdminPayload {
  fullName: string;
  username: string;
  password: string;
}

type UserModelLike = {
  count: () => Promise<number>;
  findOne: (args: unknown) => Promise<unknown>;
  create: (values: Record<string, unknown>) => Promise<unknown>;
};

export const hasUsers = async (UserModel: UserModelLike): Promise<boolean> => {
  return (await UserModel.count()) > 0;
};

export const maybeSeedDevelopmentAdmin = async (
  UserModel: UserModelLike,
  isDevelopment = process.env.NODE_ENV === 'development'
): Promise<boolean> => {
  if (!isDevelopment || process.env.SEED_DEV_ADMIN !== 'true') {
    return false;
  }

  const admin = await UserModel.findOne({ where: { role: 'admin' } });

  if (admin) {
    return false;
  }

  const hashedPassword = await hash('admin', 12);

  await UserModel.create({
    fullName: 'admin',
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
  });

  return true;
};

export const createInitialAdmin = async (
  UserModel: UserModelLike,
  values: InitialAdminPayload
) => {
  if (await hasUsers(UserModel)) {
    throw new Error('Initial admin has already been configured');
  }

  const hashedPassword = await hash(values.password, 12);

  return UserModel.create({
    fullName: values.fullName,
    username: values.username,
    password: hashedPassword,
    role: 'admin',
  });
};
