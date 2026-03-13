import { ipcMain } from 'electron';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  getUsers,
  getUserById,
  updateUser,
  createUser,
  findOneUser,
  deleteUser,
} from '../../services/user.service';

export function registerUserHandlers(): void {
  ipcMain.handle(
    'user:login',
    async (_event, credentials: { username: string; password: string }) => {
      const schema = z.object({
        username: z.string().min(3).max(255),
        password: z.string().min(3).max(255),
      });
      schema.parse(credentials);

      const user = await findOneUser({
        where: { username: credentials.username },
      });
      if (!user) throw new Error('A user with this username could not be found');

      const validPassword = await bcrypt.compare(
        credentials.password,
        (user as any).password
      );
      if (!validPassword) throw new Error('Invalid password');

      return (user as any).toJSON ? (user as any).toJSON() : user;
    }
  );

  ipcMain.handle('user:getAll', async () => {
    const users = await getUsers({});
    return users.map((u: any) => (u.toJSON ? u.toJSON() : u));
  });

  ipcMain.handle('user:getById', async (_event, id: number) => {
    const user = await getUserById(id);
    return (user as any).toJSON ? (user as any).toJSON() : user;
  });

  ipcMain.handle('user:create', async (_event, values: any) => {
    const schema = z.object({
      fullName: z.string().min(3).max(255),
      username: z.string().min(3).max(255),
      password: z.string().min(3).max(255),
      role: z.string().min(3).max(255),
    });
    schema.parse(values);
    const hashedPassword = await bcrypt.hash(values.password, 12);
    await createUser({
      fullName: values.fullName,
      username: values.username,
      password: hashedPassword,
      role: values.role,
    });
  });

  ipcMain.handle('user:update', async (_event, id: number, values: any) => {
    await updateUser(id, values);
  });

  ipcMain.handle('user:delete', async (_event, id: number) => {
    const user = await deleteUser(id);
    if (user) await (user as any).destroy();
  });
}
