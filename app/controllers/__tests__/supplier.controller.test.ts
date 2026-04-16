vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  supplier: {
    getAll: vi.fn(),
    search: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  payment: {
    getBySupplier: vi.fn(),
  },
  purchase: {
    getBySupplier: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  createSupplierFn,
  deleteSupplierFn,
  getSingleSupplierFn,
  getSupplierPaymentsFn,
  getSupplierPurchasesFn,
  getSuppliersFn,
  searchSupplierFn,
  updateSupplierFn,
} from '../supplier.controller';

const mockSupplier = {
  id: 1,
  fullName: 'Test Supplier',
  phoneNumber: '123456789',
  address: 'Test Address',
  balance: 0,
};

const mockPaginated = {
  rows: [mockSupplier],
  total: 1,
  page: 1,
  pageSize: 25,
};

describe('supplier controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user:v1',
      JSON.stringify({ id: 1, fullName: 'Jane Doe', role: 'admin' })
    );
  });

  describe('getSuppliersFn', () => {
    it('returns paginated suppliers', async () => {
      mockApi.supplier.getAll.mockResolvedValue(mockPaginated);
      const result = await getSuppliersFn();
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result on failure', async () => {
      mockApi.supplier.getAll.mockRejectedValue(new Error('DB error'));
      const result = await getSuppliersFn();
      expect(toast.error).toHaveBeenCalled();
      expect(result.rows).toEqual([]);
    });
  });

  describe('searchSupplierFn', () => {
    it('returns paginated suppliers', async () => {
      mockApi.supplier.search.mockResolvedValue(mockPaginated);
      const result = await searchSupplierFn({ search: 'Test' });
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result on failure', async () => {
      mockApi.supplier.search.mockRejectedValue(new Error('Search failed'));
      const result = await searchSupplierFn({ search: 'Test' });
      expect(result.rows).toEqual([]);
    });
  });

  describe('getSingleSupplierFn', () => {
    it('returns supplier', async () => {
      mockApi.supplier.getById.mockResolvedValue(mockSupplier);
      const result = await getSingleSupplierFn(1);
      expect(result).toEqual(mockSupplier);
    });

    it('returns null on failure', async () => {
      mockApi.supplier.getById.mockRejectedValue(new Error('Not found'));
      const result = await getSingleSupplierFn(999);
      expect(toast.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('createSupplierFn', () => {
    it('passes postedBy from session; calls toast.success and cb', async () => {
      mockApi.supplier.create.mockResolvedValue(undefined);
      const cb = vi.fn();
      await createSupplierFn(
        { fullName: 'Test Supplier', phoneNumber: '123', address: 'Addr' },
        cb
      );
      expect(mockApi.supplier.create).toHaveBeenCalledWith(
        expect.objectContaining({ postedBy: 'Jane Doe' })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Supplier successfully created'
      );
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('updateSupplierFn', () => {
    it('calls toast.success and cb on success', async () => {
      mockApi.supplier.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updateSupplierFn({ fullName: 'Updated' }, 1, cb);
      expect(toast.success).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('deleteSupplierFn', () => {
    it('calls toast.success and cb on success', async () => {
      mockApi.supplier.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteSupplierFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted');
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('getSupplierPaymentsFn', () => {
    it('calls window.api.payment.getBySupplier', async () => {
      const mockPayments = [{ id: 1, amount: 1000 }];
      mockApi.payment.getBySupplier.mockResolvedValue(mockPayments);
      const result = await getSupplierPaymentsFn(1, '2024-01-01', '2024-01-31');
      expect(mockApi.payment.getBySupplier).toHaveBeenCalledWith(
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual(mockPayments);
    });

    it('returns [] on failure', async () => {
      mockApi.payment.getBySupplier.mockRejectedValue(new Error('Failed'));
      const result = await getSupplierPaymentsFn(1);
      expect(result).toEqual([]);
    });
  });

  describe('getSupplierPurchasesFn', () => {
    it('calls window.api.purchase.getBySupplier', async () => {
      const mockPurchases = [{ id: 1, amount: 5000 }];
      mockApi.purchase.getBySupplier.mockResolvedValue(mockPurchases);
      const result = await getSupplierPurchasesFn(
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(mockApi.purchase.getBySupplier).toHaveBeenCalledWith(
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual(mockPurchases);
    });

    it('returns [] on failure', async () => {
      mockApi.purchase.getBySupplier.mockRejectedValue(new Error('Failed'));
      const result = await getSupplierPurchasesFn(1, '', '');
      expect(result).toEqual([]);
    });
  });
});
