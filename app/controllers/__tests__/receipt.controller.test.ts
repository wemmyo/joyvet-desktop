vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  receipt: {
    getAll: vi.fn(),
    search: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  getReceiptsFn,
  searchReceiptFn,
  getSingleReceiptFn,
  createReceiptFn,
  deleteReceiptFn,
  updateReceiptFn,
} from '../receipt.controller';

const mockReceipt = {
  id: 1,
  amount: 2000,
  customerId: 1,
  paymentMethod: 'cash',
};

const mockPaginated = {
  rows: [mockReceipt],
  total: 1,
  page: 1,
  pageSize: 25,
};

describe('receipt controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user:v1', JSON.stringify({ id: 1, fullName: 'Jane Doe', role: 'admin' }));
  });

  describe('getReceiptsFn', () => {
    it('returns paginated receipts', async () => {
      mockApi.receipt.getAll.mockResolvedValue(mockPaginated);
      const result = await getReceiptsFn();
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result on failure', async () => {
      mockApi.receipt.getAll.mockRejectedValue(new Error('DB error'));
      const result = await getReceiptsFn();
      expect(toast.error).toHaveBeenCalled();
      expect(result.rows).toEqual([]);
    });
  });

  describe('searchReceiptFn', () => {
    it('returns paginated receipts', async () => {
      mockApi.receipt.search.mockResolvedValue(mockPaginated);
      const result = await searchReceiptFn({ search: '1' });
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result on failure', async () => {
      mockApi.receipt.search.mockRejectedValue(new Error('Search failed'));
      const result = await searchReceiptFn({ search: '1' });
      expect(result.rows).toEqual([]);
    });
  });

  describe('getSingleReceiptFn', () => {
    it('returns receipt', async () => {
      mockApi.receipt.getById.mockResolvedValue(mockReceipt);
      const result = await getSingleReceiptFn(1);
      expect(result).toEqual(mockReceipt);
    });

    it('returns null on failure', async () => {
      mockApi.receipt.getById.mockRejectedValue(new Error('Not found'));
      const result = await getSingleReceiptFn(999);
      expect(toast.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('createReceiptFn', () => {
    it('passes postedBy from session; calls toast.success and cb', async () => {
      mockApi.receipt.create.mockResolvedValue(undefined);
      const cb = vi.fn();
      await createReceiptFn({ amount: 2000, customerId: 1, paymentMethod: 'cash' }, cb);
      expect(mockApi.receipt.create).toHaveBeenCalledWith(
        expect.objectContaining({ postedBy: 'Jane Doe' })
      );
      expect(toast.success).toHaveBeenCalledWith('Receipt successfully created');
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('deleteReceiptFn', () => {
    it('calls toast.success on success', async () => {
      mockApi.receipt.delete.mockResolvedValue(undefined);
      await deleteReceiptFn(1);
      expect(toast.success).toHaveBeenCalledWith('Receipt successfully deleted');
    });

    it('calls toast.error on failure', async () => {
      mockApi.receipt.delete.mockRejectedValue(new Error('Delete failed'));
      await deleteReceiptFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateReceiptFn', () => {
    it('returns a thunk that calls update and cb', async () => {
      mockApi.receipt.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      const thunk = updateReceiptFn({ amount: 2500 }, 1, cb);
      expect(typeof thunk).toBe('function');
      await thunk();
      expect(mockApi.receipt.update).toHaveBeenCalledWith(1, expect.objectContaining({ amount: 2500 }));
      expect(toast.success).toHaveBeenCalledWith('Successfully updated');
      expect(cb).toHaveBeenCalled();
    });
  });
});
