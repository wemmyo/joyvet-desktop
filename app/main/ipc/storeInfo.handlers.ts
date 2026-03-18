import { ipcMain } from 'electron';
import { z } from 'zod';
import {
  deleteStoreInfo,
  getStoreInfoById,
  getStoreInfos,
  createStoreInfo,
  updateStoreInfo,
} from '../../services/storeInfo.service';

const storeInfoInputSchema = z.object({
  storeName: z.string().min(3).max(255),
  address: z.string().min(3).max(255),
  phoneNumber: z.string().min(3).max(255),
});

export function registerStoreInfoHandlers(): void {
  ipcMain.handle('storeInfo:getAll', async () => {
    const storeInfos = await getStoreInfos();
    return (storeInfos as any[]).map((s: any) => (s.toJSON ? s.toJSON() : s));
  });

  ipcMain.handle('storeInfo:getById', async (_event, id: number) => {
    z.number().parse(id);
    const storeInfo = await getStoreInfoById(id);

    if (!storeInfo) {
      throw new Error('Store info not found');
    }

    return (storeInfo as any).toJSON ? (storeInfo as any).toJSON() : storeInfo;
  });

  ipcMain.handle('storeInfo:create', async (_event, values: any) => {
    const parsedValues = storeInfoInputSchema.parse(values);

    const storeInfo = await createStoreInfo(parsedValues);
    return (storeInfo as any).toJSON ? (storeInfo as any).toJSON() : storeInfo;
  });

  ipcMain.handle('storeInfo:update', async (_event, id: number, values: any) => {
    z.number().parse(id);
    const parsedValues = storeInfoInputSchema.parse(values);
    await updateStoreInfo(id, parsedValues);
  });

  ipcMain.handle('storeInfo:delete', async (_event, id: number) => {
    z.number().parse(id);
    await deleteStoreInfo(id);
  });
}
