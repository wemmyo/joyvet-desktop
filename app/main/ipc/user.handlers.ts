import { ipcMain } from 'electron';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import User from '../../models/user';
import {
  getUserById,
  updateUser,
  createUser,
  findOneUser,
  deleteUser,
} from '../../services/user.service';
import { sanitizeUserSession, type UserSession } from '../../types/session';
import {
  searchPaginationSchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';
import { ensureAuthReady, withAppReady } from '../runtime';

const toRendererUser = (user: any): Record<string, unknown> | null => {
  const serializedUser = user && user.toJSON ? user.toJSON() : user;

  if (!serializedUser || typeof serializedUser !== 'object') {
    return null;
  }

  const { password, ...safeUser } = serializedUser;
  return safeUser;
};

const toUserSession = (user: any): UserSession | null => {
  return sanitizeUserSession(toRendererUser(user));
};

export function registerUserHandlers(): void {
  ipcMain.handle(
    'user:login',
    async (_event, credentials: { username: string; password: string }) => {
      await ensureAuthReady();

      const schema = z.object({
        username: z.string().min(3).max(255),
        password: z.string().min(3).max(255),
      });
      schema.parse(credentials);

      const user = await findOneUser({
        where: { username: credentials.username },
      });
      if (!user) {
        throw new Error('A user with this username could not be found');
      }

      const validPassword = await compare(
        credentials.password,
        (user as any).password
      );
      if (!validPassword) throw new Error('Invalid password');

      const rendererUser = toUserSession(user);

      if (!rendererUser) {
        throw new Error('Invalid user session');
      }

      return rendererUser;
    }
  );

  ipcMain.handle(
    'user:getAll',
    withAppReady(async (_event, input: unknown = {}) => {
      const query = searchPaginationSchema.parse(input);
      const { page, pageSize } = query;
      const { rows, count } = await User.findAndCountAll({
        ...toPaginationOptions({ page, pageSize }),
        order: [['createdAt', 'DESC']],
      });

      return toPaginatedResult(
        rows
          .map((user: any) => toRendererUser(user))
          .filter(
            (
              user: Record<string, unknown> | null
            ): user is Record<string, unknown> => user !== null
          ),
        count,
        page,
        pageSize
      );
    })
  );

  ipcMain.handle(
    'user:getById',
    withAppReady(async (_event, id: number) => {
      z.number().parse(id);
      const user = await getUserById(id);
      return toRendererUser(user);
    })
  );

  ipcMain.handle(
    'user:create',
    withAppReady(async (_event, values: any) => {
      const schema = z.object({
        fullName: z.string().min(3).max(255),
        username: z.string().min(3).max(255),
        password: z.string().min(8).max(255),
        role: z.enum(['admin', 'manager', 'staff', 'newbie']),
      });
      schema.parse(values);
      const hashedPassword = await hash(values.password, 12);
      await createUser({
        fullName: values.fullName,
        username: values.username,
        password: hashedPassword,
        role: values.role,
      });
    })
  );

  ipcMain.handle(
    'user:update',
    withAppReady(async (_event, id: number, values: any) => {
      z.number().parse(id);
      const updateSchema = z.object({
        fullName: z.string().min(3).max(255).optional(),
        username: z.string().min(3).max(255).optional(),
        role: z.enum(['admin', 'manager', 'staff', 'newbie']).optional(),
        password: z.string().min(8).max(255).optional(),
      });
      const parsed = updateSchema.parse(values);
      if (parsed.password) {
        parsed.password = await hash(parsed.password, 12);
      }
      await updateUser(id, parsed);
    })
  );

  ipcMain.handle(
    'user:delete',
    withAppReady(async (_event, id: number) => {
      z.number().parse(id);
      const user = await User.findByPk(id);
      if (user && (user as any).role === 'admin') {
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
          throw new Error('Cannot delete the last admin account');
        }
      }
      await deleteUser(id);
    })
  );
}
