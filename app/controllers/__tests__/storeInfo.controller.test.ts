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
  getStoreInfoFn,
  getSingleStoreInfoFn,
  createStoreInfoFn,
  updateStoreInfoFn,
  deleteStoreInfoFn,
} from '../storeInfo.controller';

const mockStoreInfo = {
  id: 1,
  storeName: 'JoyVet Clinic',
  address: '123 Main St',
  phoneNumber: '0801234567',
};

describe('storeInfo controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStoreInfoFn', () => {
    it('returns store info on success', async () => {
      mockApi.storeInfo.getAll.mockResolvedValue([mockStoreInfo]);
      const result = await getStoreInfoFn();
      expect(result).toEqual([mockStoreInfo]);
      expect(mockApi.storeInfo.getAll).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.storeInfo.getAll.mockRejectedValue(new Error('DB error'));
      await getStoreInfoFn();
      expect(toast.error).toHaveBeenCalledWith('DB error');
    });
  });

  describe('getSingleStoreInfoFn', () => {
    it('returns a single store info by id', async () => {
      mockApi.storeInfo.getById.mockResolvedValue(mockStoreInfo);
      const cb = vi.fn();
      const result = await getSingleStoreInfoFn(1, cb);
      expect(result).toEqual(mockStoreInfo);
      expect(mockApi.storeInfo.getById).toHaveBeenCalledWith(1);
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.storeInfo.getById.mockRejectedValue(new Error('Not found'));
      await getSingleStoreInfoFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('createStoreInfoFn', () => {
    it('creates store info and calls callback', async () => {
      mockApi.storeInfo.create.mockResolvedValue(mockStoreInfo);
      const cb = vi.fn();
      await createStoreInfoFn(
        {
          storeName: 'JoyVet Clinic',
          address: '123 Main St',
          phoneNumber: '0801234567',
        },
        cb
      );
      expect(mockApi.storeInfo.create).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.storeInfo.create.mockRejectedValue(new Error('Create failed'));
      await createStoreInfoFn({ storeName: 'JoyVet' });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateStoreInfoFn', () => {
    it('updates store info and calls callback', async () => {
      mockApi.storeInfo.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updateStoreInfoFn(
        {
          storeName: 'Updated Clinic',
          address: '456 New St',
          phoneNumber: '0809876543',
        },
        1,
        cb
      );
      expect(mockApi.storeInfo.update).toHaveBeenCalledWith(1, {
        storeName: 'Updated Clinic',
        address: '456 New St',
        phoneNumber: '0809876543',
      });
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.storeInfo.update.mockRejectedValue(new Error('Update failed'));
      await updateStoreInfoFn({ storeName: 'Updated' }, 1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deleteStoreInfoFn', () => {
    it('deletes store info and calls toast.success', async () => {
      mockApi.storeInfo.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteStoreInfoFn(1, cb);
      expect(mockApi.storeInfo.delete).toHaveBeenCalledWith(1);
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
