vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  purchase: {
    getAll: vi.fn(),
    search: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  getPurchasesFn,
  searchPurchaseFn,
  getSinglePurchaseFn,
  createPurchaseFn,
  deletePurchaseFn,
} from '../purchase.controller';

const mockPurchase = {
  id: 1,
  invoiceNumber: 'INV-001',
  amount: 5000,
  supplierId: 1,
};

const mockPaginated = {
  rows: [mockPurchase],
  total: 1,
  page: 1,
  pageSize: 25,
};

describe('purchase controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user:v1', JSON.stringify({ id: 1, fullName: 'Jane Doe', role: 'admin' }));
  });

  describe('getPurchasesFn', () => {
    it('returns paginated purchases', async () => {
      mockApi.purchase.getAll.mockResolvedValue(mockPaginated);
      const result = await getPurchasesFn();
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result on failure', async () => {
      mockApi.purchase.getAll.mockRejectedValue(new Error('DB error'));
      const result = await getPurchasesFn();
      expect(toast.error).toHaveBeenCalled();
      expect(result.rows).toEqual([]);
    });
  });

  describe('searchPurchaseFn', () => {
    it('returns paginated purchases', async () => {
      mockApi.purchase.search.mockResolvedValue(mockPaginated);
      const result = await searchPurchaseFn({ search: 'INV' });
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result on failure', async () => {
      mockApi.purchase.search.mockRejectedValue(new Error('Search failed'));
      const result = await searchPurchaseFn({ search: 'INV' });
      expect(result.rows).toEqual([]);
    });
  });

  describe('getSinglePurchaseFn', () => {
    it('returns purchase', async () => {
      mockApi.purchase.getById.mockResolvedValue(mockPurchase);
      const result = await getSinglePurchaseFn(1);
      expect(result).toEqual(mockPurchase);
    });

    it('returns undefined on failure', async () => {
      mockApi.purchase.getById.mockRejectedValue(new Error('Not found'));
      const result = await getSinglePurchaseFn(999);
      expect(toast.error).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('createPurchaseFn', () => {
    it('passes postedBy from session; calls toast.success and cb', async () => {
      mockApi.purchase.create.mockResolvedValue(undefined);
      const cb = vi.fn();
      await createPurchaseFn([], { supplierId: 1, invoiceNumber: 'INV-001', amount: 5000 } as any, cb);
      expect(mockApi.purchase.create).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ postedBy: 'Jane Doe' })
      );
      expect(toast.success).toHaveBeenCalledWith('Purchase created');
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('deletePurchaseFn', () => {
    it('calls toast.success and cb on success', async () => {
      mockApi.purchase.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deletePurchaseFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('Purchase deleted');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.purchase.delete.mockRejectedValue(new Error('Delete failed'));
      await deletePurchaseFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
