vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  receipt: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
  getReceiptsFn,
  getSingleReceiptFn,
  createReceiptFn,
  updateReceiptFn,
  deleteReceiptFn,
  searchReceiptFn,
} from '../receipt.controller';

const mockReceipt = {
  id: 1,
  amount: 500,
  customerId: 1,
  paymentMethod: 'cash',
  bank: '',
  postedBy: 'admin',
};

describe('receipt controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ fullName: 'admin', role: 'admin' })
    );
  });

  describe('getReceiptsFn', () => {
    it('returns all receipts on success', async () => {
      mockApi.receipt.getAll.mockResolvedValue([mockReceipt]);
      const result = await getReceiptsFn();
      expect(result).toEqual([mockReceipt]);
      expect(mockApi.receipt.getAll).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.receipt.getAll.mockRejectedValue(new Error('DB error'));
      await getReceiptsFn();
      expect(toast.error).toHaveBeenCalledWith('DB error');
    });
  });

  describe('getSingleReceiptFn', () => {
    it('returns a single receipt by id', async () => {
      mockApi.receipt.getById.mockResolvedValue(mockReceipt);
      const cb = vi.fn();
      const result = await getSingleReceiptFn(1, cb);
      expect(result).toEqual(mockReceipt);
      expect(mockApi.receipt.getById).toHaveBeenCalledWith(1);
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.receipt.getById.mockRejectedValue(new Error('Not found'));
      await getSingleReceiptFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('createReceiptFn', () => {
    it('creates a receipt and calls toast.success', async () => {
      mockApi.receipt.create.mockResolvedValue(mockReceipt);
      const cb = vi.fn();
      await createReceiptFn(
        { amount: 500, customerId: 1, paymentMethod: 'cash' },
        cb
      );
      expect(mockApi.receipt.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Receipt successfully created');
      expect(cb).toHaveBeenCalled();
    });

    it('passes postedBy from localStorage user', async () => {
      mockApi.receipt.create.mockResolvedValue(mockReceipt);
      await createReceiptFn({ amount: 500, customerId: 1, paymentMethod: 'cash' });
      expect(mockApi.receipt.create).toHaveBeenCalledWith(
        expect.objectContaining({ postedBy: 'admin' })
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.receipt.create.mockRejectedValue(new Error('Create failed'));
      await createReceiptFn({});
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateReceiptFn', () => {
    it('returns a function that updates a receipt and calls toast.success', async () => {
      mockApi.receipt.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      const updateFn = updateReceiptFn(
        { amount: 750, paymentMethod: 'bank' },
        1,
        cb
      );
      await updateFn();
      expect(mockApi.receipt.update).toHaveBeenCalledWith(1, {
        amount: 750,
        paymentMethod: 'bank',
      });
      expect(toast.success).toHaveBeenCalledWith('Successfully updated');
      expect(cb).toHaveBeenCalled();
    });

    it('returned function calls toast.error on failure', async () => {
      mockApi.receipt.update.mockRejectedValue(new Error('Update failed'));
      const updateFn = updateReceiptFn({ amount: 750 }, 1);
      await updateFn();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deleteReceiptFn', () => {
    it('deletes a receipt and calls toast.success', async () => {
      mockApi.receipt.delete.mockResolvedValue(undefined);
      await deleteReceiptFn(1);
      expect(mockApi.receipt.delete).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Receipt successfully deleted');
    });

    it('calls toast.error on failure', async () => {
      mockApi.receipt.delete.mockRejectedValue(new Error('Delete failed'));
      await deleteReceiptFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('searchReceiptFn', () => {
    it('returns matching receipts', async () => {
      mockApi.receipt.search.mockResolvedValue([mockReceipt]);
      const result = await searchReceiptFn('cash');
      expect(result).toEqual([mockReceipt]);
      expect(mockApi.receipt.search).toHaveBeenCalledWith('cash');
    });

    it('calls toast.error on failure', async () => {
      mockApi.receipt.search.mockRejectedValue(new Error('Search failed'));
      await searchReceiptFn('cash');
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
