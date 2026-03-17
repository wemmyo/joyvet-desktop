vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  purchase: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  getPurchasesFn,
  getSinglePurchaseFn,
  createPurchaseFn,
  deletePurchaseFn,
  searchPurchaseFn,
} from '../purchase.controller';

const mockPurchase = {
  id: 1,
  invoiceNumber: 'INV-001',
  amount: 5000,
  supplierId: 1,
  postedBy: 'admin',
};

const mockPurchaseItems = [
  {
    id: 1,
    quantity: 10,
    unitPrice: 500,
    amount: 5000,
    newSellPrice: 600,
    newSellPrice2: 650,
    newSellPrice3: 700,
    buyPrice: 480,
    sellPrice: 580,
    sellPrice2: 630,
    sellPrice3: 680,
    stock: 5,
  },
];

describe('purchase controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ fullName: 'admin', role: 'admin' })
    );
  });

  describe('getPurchasesFn', () => {
    it('returns all purchases on success', async () => {
      mockApi.purchase.getAll.mockResolvedValue([mockPurchase]);
      const result = await getPurchasesFn();
      expect(result).toEqual([mockPurchase]);
      expect(mockApi.purchase.getAll).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.purchase.getAll.mockRejectedValue(new Error('DB error'));
      await getPurchasesFn();
      expect(toast.error).toHaveBeenCalledWith('DB error');
    });
  });

  describe('getSinglePurchaseFn', () => {
    it('returns a single purchase by id', async () => {
      mockApi.purchase.getById.mockResolvedValue(mockPurchase);
      const cb = vi.fn();
      const result = await getSinglePurchaseFn(1, cb);
      expect(result).toEqual(mockPurchase);
      expect(mockApi.purchase.getById).toHaveBeenCalledWith(1);
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.purchase.getById.mockRejectedValue(new Error('Not found'));
      await getSinglePurchaseFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('createPurchaseFn', () => {
    it('creates a purchase and calls toast.success', async () => {
      mockApi.purchase.create.mockResolvedValue(mockPurchase);
      const cb = vi.fn();
      await createPurchaseFn(
        mockPurchaseItems as any,
        { supplierId: 1, invoiceNumber: 'INV-001', amount: 5000 } as any,
        cb
      );
      expect(mockApi.purchase.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Purchase created');
      expect(cb).toHaveBeenCalled();
    });

    it('passes postedBy from localStorage user', async () => {
      mockApi.purchase.create.mockResolvedValue(mockPurchase);
      await createPurchaseFn(
        mockPurchaseItems as any,
        { supplierId: 1, invoiceNumber: 'INV-001', amount: 5000 } as any
      );
      expect(mockApi.purchase.create).toHaveBeenCalledWith(
        mockPurchaseItems,
        expect.objectContaining({ postedBy: 'admin' })
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.purchase.create.mockRejectedValue(new Error('Create failed'));
      await createPurchaseFn([], {} as any);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deletePurchaseFn', () => {
    it('deletes a purchase and calls toast.success', async () => {
      mockApi.purchase.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deletePurchaseFn(1, cb);
      expect(mockApi.purchase.delete).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Purchase deleted');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.purchase.delete.mockRejectedValue(new Error('Delete failed'));
      await deletePurchaseFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('searchPurchaseFn', () => {
    it('returns matching purchases', async () => {
      mockApi.purchase.search.mockResolvedValue([mockPurchase]);
      const result = await searchPurchaseFn('INV-001');
      expect(result).toEqual([mockPurchase]);
      expect(mockApi.purchase.search).toHaveBeenCalledWith('INV-001');
    });

    it('calls toast.error on failure', async () => {
      mockApi.purchase.search.mockRejectedValue(new Error('Search failed'));
      await searchPurchaseFn('INV');
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
