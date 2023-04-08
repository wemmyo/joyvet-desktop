import { toast } from 'react-toastify';
import bycrpt from 'bcryptjs';
import { z } from 'zod';
import { IUser } from '../models/user';
import {
  getUsers as getUsersService,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  createUser as createUserService,
  findOneUser as findOneUserService,
  deleteUser as deleteUserService,
} from '../services/user.service';

export const loginUserFn = async (
  values: { username: string; password: string },
  cb?: () => void
) => {
  // use zod to validate input
  const LoginSchema = z.object({
    username: z.string().min(3).max(255),
    password: z.string().min(3).max(255),
  });

  let loadedUser;
  try {
    LoginSchema.parse(values);
    const user = await findOneUserService({
      where: {
        username: values.username,
      },
    });
    if (!user) {
      throw new Error('A user with this username could not be found');
    } else {
      loadedUser = user;

      const validPassword = await bycrpt.compare(
        values.password,
        user.password
      );
      if (validPassword) {
        localStorage.setItem('user', JSON.stringify(loadedUser));

        if (cb) {
          cb();
        }
      } else {
        throw new Error('Invalid password');
      }
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const logoutFn = (cb: () => void) => async () => {
  localStorage.removeItem('user');
  cb();
  // window.location.reload(false);
};

export const updateUserFn = async (
  values: Partial<IUser>,
  id: number,
  cb?: () => void
) => {
  // use zod to validate input
  const UpdateUserSchema = z.object({
    fullName: z.string().min(3).max(255),
    username: z.string().min(3).max(255),
    email: z.string().min(3).max(255),
    password: z.string().min(3).max(255),
  });

  try {
    UpdateUserSchema.parse(values);
    await updateUserService(id, values);
    // toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleUserFn = async (id: number, cb?: () => void) => {
  // use zod to validate input
  const GetSingleUserSchema = z.object({
    id: z.number(),
  });

  try {
    GetSingleUserSchema.parse({ id });

    const getSingleUserResponse = await getUserByIdService(id);

    if (cb) {
      cb();
    }

    return getSingleUserResponse;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const deleteUserFn = async (userId: number, cb?: () => void) => {
  // use zod to validate input
  const DeleteUserSchema = z.object({
    id: z.string().min(3).max(255),
  });

  try {
    DeleteUserSchema.parse({ id: userId });
    const user = await deleteUserService(userId);
    user.destroy();
    toast.success('User successfully deleted');

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getUsersFn = async () => {
  try {
    const users = await getUsersService({});
    return users;
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createUserFn = async (values: any, cb?: () => void) => {
  // use zod to validate input
  const CreateUserSchema = z.object({
    fullName: z.string().min(3).max(255),
    username: z.string().min(3).max(255),
    password: z.string().min(3).max(255),
    role: z.string().min(3).max(255),
  });

  try {
    CreateUserSchema.parse(values);
    // const response = await User.create(values);
    const hashedPassword = await bycrpt.hash(values.password, 12);
    await createUserService({
      fullName: values.fullName || null,
      username: values.username || null,
      password: hashedPassword || null,
      role: values.role || null,
    });

    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};
