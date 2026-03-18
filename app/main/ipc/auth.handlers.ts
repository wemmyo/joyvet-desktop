import { ipcMain } from 'electron';
import { z } from 'zod';
import { sanitizeUserSession } from '../../types/session';
import { createInitialAdmin, hasUsers } from '../bootstrap';
import { ensureAuthReady } from '../runtime';

const initialAdminSchema = z.object({
  fullName: z.string().min(3).max(255),
  username: z.string().min(3).max(255),
  password: z.string().min(8).max(255),
});

export function registerAuthHandlers(): void {
  ipcMain.handle('auth:getBootstrapStatus', async () => {
    const { User } = await ensureAuthReady();

    return {
      hasUsers: await hasUsers(User as any),
    };
  });

  ipcMain.handle('auth:createInitialAdmin', async (_event, values: unknown) => {
    const { User } = await ensureAuthReady();
    const parsedValues = initialAdminSchema.parse(values);
    const user = await createInitialAdmin(User as any, parsedValues);
    const session = sanitizeUserSession(
      (user as any)?.toJSON ? (user as any).toJSON() : user
    );

    if (!session) {
      throw new Error('Invalid user session');
    }

    return session;
  });
}
