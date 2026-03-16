const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
  app: { getPath: () => '/tmp/test', quit: vi.fn() },
  dialog: {
    showOpenDialogSync: vi.fn(() => ['/tmp/test.db']),
    showSaveDialogSync: vi.fn(() => '/tmp/test.db'),
  },
}));

vi.mock('../../../services/storeInfo.service', () => ({
  getStoreInfos: vi.fn(),
  createStoreInfo: vi.fn(),
  updateStoreInfo: vi.fn(),
}));

import * as storeInfoService from '../../../services/storeInfo.service';
import { registerStoreInfoHandlers } from '../storeInfo.handlers';

const mockEvent = {} as any;

const mockStoreInfo = {
  id: 1,
  storeName: 'JoyVet Clinic',
  address: '123 Main Street',
  phoneNumber: '08012345678',
  toJSON: () => ({
    id: 1,
    storeName: 'JoyVet Clinic',
    address: '123 Main Street',
    phoneNumber: '08012345678',
  }),
};

describe('storeInfo IPC handlers', () => {
  beforeAll(() => {
    registerStoreInfoHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ get
  describe('storeInfo:get', () => {
    it('returns all store info serialized', async () => {
      (storeInfoService.getStoreInfos as any).mockResolvedValue([mockStoreInfo]);
      const result = await handlers['storeInfo:get'](mockEvent);
      expect(result).toEqual([mockStoreInfo.toJSON()]);
    });

    it('returns empty array when no store info exists', async () => {
      (storeInfoService.getStoreInfos as any).mockResolvedValue([]);
      const result = await handlers['storeInfo:get'](mockEvent);
      expect(result).toEqual([]);
    });

    it('throws on service error', async () => {
      (storeInfoService.getStoreInfos as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['storeInfo:get'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // ------------------------------------------------------------------ create
  describe('storeInfo:create', () => {
    it('creates store info and returns serialized result', async () => {
      (storeInfoService.createStoreInfo as any).mockResolvedValue(mockStoreInfo);
      const result = await handlers['storeInfo:create'](mockEvent, {
        storeName: 'JoyVet Clinic',
        address: '123 Main Street',
        phoneNumber: '08012345678',
      });
      expect(storeInfoService.createStoreInfo).toHaveBeenCalled();
      expect(result).toEqual(mockStoreInfo.toJSON());
    });

    it('throws on validation error when storeName is too short', async () => {
      await expect(
        handlers['storeInfo:create'](mockEvent, {
          storeName: 'AB',
          address: '123 Main Street',
          phoneNumber: '08012345678',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when address is too short', async () => {
      await expect(
        handlers['storeInfo:create'](mockEvent, {
          storeName: 'JoyVet Clinic',
          address: 'AB',
          phoneNumber: '08012345678',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when phoneNumber is too short', async () => {
      await expect(
        handlers['storeInfo:create'](mockEvent, {
          storeName: 'JoyVet Clinic',
          address: '123 Main Street',
          phoneNumber: 'AB',
        })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ update
  describe('storeInfo:update', () => {
    it('updates store info', async () => {
      (storeInfoService.updateStoreInfo as any).mockResolvedValue(undefined);
      await handlers['storeInfo:update'](mockEvent, {
        id: 1,
        storeName: 'Updated Clinic',
        address: '456 New Street',
        phoneNumber: '09098765432',
      });
      expect(storeInfoService.updateStoreInfo).toHaveBeenCalledWith(1, {
        storeName: 'Updated Clinic',
        address: '456 New Street',
        phoneNumber: '09098765432',
      });
    });

    it('throws on validation error when storeName is too short', async () => {
      await expect(
        handlers['storeInfo:update'](mockEvent, {
          id: 1,
          storeName: 'AB',
          address: '456 New Street',
          phoneNumber: '09098765432',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when id is missing', async () => {
      await expect(
        handlers['storeInfo:update'](mockEvent, {
          storeName: 'Updated Clinic',
          address: '456 New Street',
          phoneNumber: '09098765432',
        })
      ).rejects.toThrow();
    });
  });
});
