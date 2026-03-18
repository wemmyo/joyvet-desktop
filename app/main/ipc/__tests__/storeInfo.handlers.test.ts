const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
  },
}));

vi.mock('../../../services/storeInfo.service', () => ({
  getStoreInfos: vi.fn(),
  getStoreInfoById: vi.fn(),
  createStoreInfo: vi.fn(),
  updateStoreInfo: vi.fn(),
  deleteStoreInfo: vi.fn(),
}));

import * as storeInfoService from '../../../services/storeInfo.service';
import { registerStoreInfoHandlers } from '../storeInfo.handlers';

const mockEvent = {} as any;

const mockStoreInfo = {
  id: 1,
  storeName: 'JoyVet Clinic',
  address: '123 Main Street',
  phoneNumber: '1234567890',
  toJSON: () => ({
    id: 1,
    storeName: 'JoyVet Clinic',
    address: '123 Main Street',
    phoneNumber: '1234567890',
  }),
};

describe('storeInfo IPC handlers', () => {
  beforeAll(() => {
    registerStoreInfoHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('storeInfo:getAll', () => {
    it('calls getStoreInfos', async () => {
      (storeInfoService.getStoreInfos as any).mockResolvedValue([mockStoreInfo]);
      const result = await handlers['storeInfo:getAll'](mockEvent);
      expect(storeInfoService.getStoreInfos).toHaveBeenCalled();
      expect(result).toEqual([mockStoreInfo.toJSON()]);
    });
  });

  describe('storeInfo:getById', () => {
    it('calls getStoreInfoById', async () => {
      (storeInfoService.getStoreInfoById as any).mockResolvedValue(mockStoreInfo);
      const result = await handlers['storeInfo:getById'](mockEvent, 1);
      expect(storeInfoService.getStoreInfoById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStoreInfo.toJSON());
    });
  });

  describe('storeInfo:create', () => {
    it('validates storeName/address/phoneNumber (min 3 chars) and calls createStoreInfo', async () => {
      (storeInfoService.createStoreInfo as any).mockResolvedValue(mockStoreInfo);
      const result = await handlers['storeInfo:create'](mockEvent, {
        storeName: 'JoyVet Clinic',
        address: '123 Main Street',
        phoneNumber: '1234567890',
      });
      expect(storeInfoService.createStoreInfo).toHaveBeenCalled();
      expect(result).toEqual(mockStoreInfo.toJSON());
    });

    it('throws on short storeName (< 3 chars)', async () => {
      await expect(
        handlers['storeInfo:create'](mockEvent, {
          storeName: 'AB',
          address: '123 Main Street',
          phoneNumber: '1234567890',
        })
      ).rejects.toThrow();
    });
  });

  describe('storeInfo:update', () => {
    it('calls updateStoreInfo', async () => {
      (storeInfoService.updateStoreInfo as any).mockResolvedValue(undefined);
      await handlers['storeInfo:update'](mockEvent, 1, {
        storeName: 'Updated Clinic',
        address: '456 Side Street',
        phoneNumber: '0987654321',
      });
      expect(storeInfoService.updateStoreInfo).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ storeName: 'Updated Clinic' })
      );
    });
  });

  describe('storeInfo:delete', () => {
    it('calls deleteStoreInfo', async () => {
      (storeInfoService.deleteStoreInfo as any).mockResolvedValue(undefined);
      await handlers['storeInfo:delete'](mockEvent, 1);
      expect(storeInfoService.deleteStoreInfo).toHaveBeenCalledWith(1);
    });
  });
});
