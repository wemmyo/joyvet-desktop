vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  supplier: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    getPayments: vi.fn(),
    getPurchases: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  getSuppliersFn,
  getSingleSupplierFn,
  createSupplierFn,
  updateSupplierFn,
  deleteSupplierFn,
  searchSupplierFn,
  getSupplierPaymentsFn,
  getSupplierPurchasesFn,
} from '../supplier.controller';

const mockSupplier = {
  id: 1,
  fullName: 'Test Supplier',
  phoneNumber: '123456789',
  address: 'Test Address',
  balance: 0,
  postedBy: 'admin',
};

describe('supplier controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ fullName: 'admin', role: 'admin' })
    );
  });

  describe('getSuppliersFn', () => {
    it('returns all suppliers on success', async () => {
      mockApi.supplier.getAll.mockResolvedValue([mockSupplier]);
      const result = await getSuppliersFn();
      expect(result).toEqual([mockSupplier]);
      expect(mockApi.supplier.getAll).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.getAll.mockRejectedValue(new Error('DB error'));
      await getSuppliersFn();
      expect(toast.error).toHaveBeenCalledWith('DB error');
    });
  });

  describe('getSingleSupplierFn', () => {
    it('returns a single supplier by id', async () => {
      mockApi.supplier.getById.mockResolvedValue(mockSupplier);
      const result = await getSingleSupplierFn(1);
      expect(result).toEqual(mockSupplier);
      expect(mockApi.supplier.getById).toHaveBeenCalledWith(1);
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.getById.mockRejectedValue(new Error('Not found'));
      await getSingleSupplierFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('createSupplierFn', () => {
    it('creates a supplier and calls toast.success', async () => {
      mockApi.supplier.create.mockResolvedValue(mockSupplier);
      const cb = vi.fn();
      await createSupplierFn(
        { fullName: 'Test Supplier', phoneNumber: '123', address: 'Addr' },
        cb
      );
      expect(mockApi.supplier.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Supplier successfully created');
      expect(cb).toHaveBeenCalled();
    });

    it('passes postedBy from localStorage user', async () => {
      mockApi.supplier.create.mockResolvedValue(mockSupplier);
      await createSupplierFn({ fullName: 'Test' });
      expect(mockApi.supplier.create).toHaveBeenCalledWith(
        expect.objectContaining({ postedBy: 'admin' })
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.create.mockRejectedValue(new Error('Create failed'));
      await createSupplierFn({ fullName: 'Test' });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateSupplierFn', () => {
    it('updates a supplier and calls toast.success', async () => {
      mockApi.supplier.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updateSupplierFn(
        { fullName: 'Updated', phoneNumber: '123', address: 'Addr' },
        1,
        cb
      );
      expect(mockApi.supplier.update).toHaveBeenCalledWith(1, {
        fullName: 'Updated',
        phoneNumber: '123',
        address: 'Addr',
      });
      expect(toast.success).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.update.mockRejectedValue(new Error('Update failed'));
      await updateSupplierFn({ fullName: 'Updated' }, 1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deleteSupplierFn', () => {
    it('deletes a supplier and calls toast.success', async () => {
      mockApi.supplier.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteSupplierFn(1, cb);
      expect(mockApi.supplier.delete).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.delete.mockRejectedValue(new Error('Delete failed'));
      await deleteSupplierFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('searchSupplierFn', () => {
    it('returns matching suppliers', async () => {
      mockApi.supplier.search.mockResolvedValue([mockSupplier]);
      const result = await searchSupplierFn('Test');
      expect(result).toEqual([mockSupplier]);
      expect(mockApi.supplier.search).toHaveBeenCalledWith('Test');
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.search.mockRejectedValue(new Error('Search failed'));
      await searchSupplierFn('Test');
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('getSupplierPaymentsFn', () => {
    it('returns payments for a supplier', async () => {
      const mockPayments = [{ id: 1, amount: 500 }];
      mockApi.supplier.getPayments.mockResolvedValue(mockPayments);
      const result = await getSupplierPaymentsFn(1, '2024-01-01', '2024-01-31');
      expect(result).toEqual(mockPayments);
      expect(mockApi.supplier.getPayments).toHaveBeenCalledWith(
        1,
        '2024-01-01',
        '2024-01-31'
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.getPayments.mockRejectedValue(new Error('Failed'));
      await getSupplierPaymentsFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('getSupplierPurchasesFn', () => {
    it('returns purchases for a supplier', async () => {
      const mockPurchases = [{ id: 1, amount: 1000 }];
      mockApi.supplier.getPurchases.mockResolvedValue(mockPurchases);
      const result = await getSupplierPurchasesFn(
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual(mockPurchases);
      expect(mockApi.supplier.getPurchases).toHaveBeenCalledWith(
        1,
        '2024-01-01',
        '2024-01-31'
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.supplier.getPurchases.mockRejectedValue(new Error('Failed'));
      await getSupplierPurchasesFn(1, '2024-01-01', '2024-01-31');
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
