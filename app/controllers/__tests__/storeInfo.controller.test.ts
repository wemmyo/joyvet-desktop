vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  storeInfo: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  createStoreInfoFn,
  deleteStoreInfoFn,
  getSingleStoreInfoFn,
  getStoreInfoFn,
  updateStoreInfoFn,
} from '../storeInfo.controller';

const mockStoreInfo = {
  id: 1,
  storeName: 'JoyVet Clinic',
  address: '123 Main Street',
  phoneNumber: '1234567890',
};

describe('storeInfo controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStoreInfoFn', () => {
    it('returns array', async () => {
      mockApi.storeInfo.getAll.mockResolvedValue([mockStoreInfo]);
      const result = await getStoreInfoFn();
      expect(result).toEqual([mockStoreInfo]);
    });

    it('returns [] on failure', async () => {
      mockApi.storeInfo.getAll.mockRejectedValue(new Error('DB error'));
      const result = await getStoreInfoFn();
      expect(toast.error).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getSingleStoreInfoFn', () => {
    it('returns item and calls cb', async () => {
      mockApi.storeInfo.getById.mockResolvedValue(mockStoreInfo);
      const cb = vi.fn();
      const result = await getSingleStoreInfoFn(1, cb);
      expect(result).toEqual(mockStoreInfo);
      expect(cb).toHaveBeenCalled();
    });

    it('returns undefined on failure', async () => {
      mockApi.storeInfo.getById.mockRejectedValue(new Error('Not found'));
      const result = await getSingleStoreInfoFn(999);
      expect(toast.error).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('createStoreInfoFn', () => {
    it('calls create and cb', async () => {
      mockApi.storeInfo.create.mockResolvedValue(mockStoreInfo);
      const cb = vi.fn();
      await createStoreInfoFn(
        {
          storeName: 'JoyVet Clinic',
          address: '123 Main Street',
          phoneNumber: '1234567890',
        },
        cb
      );
      expect(mockApi.storeInfo.create).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.storeInfo.create.mockRejectedValue(new Error('Create failed'));
      await createStoreInfoFn({ storeName: 'Test' });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateStoreInfoFn', () => {
    it('calls update and cb', async () => {
      mockApi.storeInfo.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updateStoreInfoFn({ storeName: 'Updated Clinic' }, 1, cb);
      expect(mockApi.storeInfo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ storeName: 'Updated Clinic' })
      );
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.storeInfo.update.mockRejectedValue(new Error('Update failed'));
      await updateStoreInfoFn({ storeName: 'Updated' }, 1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deleteStoreInfoFn', () => {
    it('calls toast.success and cb', async () => {
      mockApi.storeInfo.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteStoreInfoFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith(
        'Store Info successfully deleted'
      );
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.storeInfo.delete.mockRejectedValue(new Error('Delete failed'));
      await deleteStoreInfoFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
