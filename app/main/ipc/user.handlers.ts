import { compare, hash } from 'bcryptjs';
import { ipcMain } from 'electron';
import { z } from 'zod';
import User from '../../models/user';
import {
  createUser,
  findOneUser,
  getUserById,
  updateUser,
} from '../../services/user.service';
import { type UserSession, sanitizeUserSession } from '../../types/session';
import database from '../database';
import { ensureAuthReady, withAppReady } from '../runtime';
import { requireRole, setActiveSession } from '../session';
import {
  searchPaginationSchema,
  toPaginatedResult,
  toPaginationOptions,
} from './listing';

const toRendererUser = (user: any): Record<string, unknown> | null => {
  const serializedUser = user?.toJSON ? user.toJSON() : user;

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

      // Store the session in the main process so IPC handlers can check roles.
      setActiveSession({
        id: rendererUser.id,
        role: rendererUser.role,
        fullName: rendererUser.fullName,
      });

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
      requireRole(['admin', 'manager']);
      const schema = z.object({
        fullName: z.string().min(3).max(255),
        username: z.string().min(3).max(255),
        password: z.string().min(8).max(255),
        role: z.enum(['admin', 'manager', 'staff', 'newbie']),
      });
      schema.parse(values);
      const hashedPassword = await hash(values.password, 12);
      try {
        await createUser({
          fullName: values.fullName,
          username: values.username,
          password: hashedPassword,
          role: values.role,
        });
      } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new Error(
            `A user with the username "${values.username}" already exists`
          );
        }
        throw error;
      }
    })
  );

  ipcMain.handle(
    'user:update',
    withAppReady(async (_event, id: number, values: any) => {
      requireRole(['admin', 'manager']);
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
      requireRole(['admin']);
      z.number().parse(id);
      await database.transaction(async (t: any) => {
        const user = await User.findByPk(id, { transaction: t });
        if (user && (user as any).role === 'admin') {
          const adminCount = await User.count({
            where: { role: 'admin' },
            transaction: t,
          });
          if (adminCount <= 1) {
            throw new Error('Cannot delete the last admin account');
          }
        }
        await User.destroy({ where: { id }, transaction: t });
      });
    })
  );

  ipcMain.handle(
    'user:logout',
    withAppReady(async () => {
      setActiveSession(null);
    })
  );
}
