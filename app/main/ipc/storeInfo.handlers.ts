import { ipcMain } from 'electron';
import { z } from 'zod';
import {
  getStoreInfos,
  createStoreInfo,
  updateStoreInfo,
} from '../../services/storeInfo.service';

export function registerStoreInfoHandlers(): void {
  ipcMain.handle('storeInfo:get', async () => {
    const storeInfos = await getStoreInfos();
    return (storeInfos as any[]).map((s: any) => (s.toJSON ? s.toJSON() : s));
  });

  ipcMain.handle('storeInfo:create', async (_event, values: any) => {
    const schema = z.object({
      storeName: z.string().min(3).max(255),
      address: z.string().min(3).max(255),
      phoneNumber: z.string().min(3).max(255),
    });
    schema.parse(values);

    const storeInfo = await createStoreInfo(values);
    return (storeInfo as any).toJSON
      ? (storeInfo as any).toJSON()
      : storeInfo;
  });

  ipcMain.handle('storeInfo:update', async (_event, values: any) => {
    const schema = z.object({
      id: z.number(),
      storeName: z.string().min(3).max(255),
      address: z.string().min(3).max(255),
      phoneNumber: z.string().min(3).max(255),
    });
    schema.parse(values);

    const { id, ...rest } = values;
    await updateStoreInfo(id, rest);
  });
}
