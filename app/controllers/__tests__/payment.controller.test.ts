vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  payment: {
    getAll: vi.fn(),
    search: vi.fn(),
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
  getPaymentsFn,
  searchPaymentFn,
  getSinglePaymentFn,
  createPaymentFn,
  updatePaymentFn,
  deletePaymentFn,
} from '../payment.controller';

const mockPayment = {
  id: 1,
  amount: 3000,
  supplierId: 1,
  paymentMethod: 'cash',
};

const mockPaginated = {
  rows: [mockPayment],
  total: 1,
  page: 1,
  pageSize: 25,
};

describe('payment controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user:v1',
      JSON.stringify({ id: 1, fullName: 'Jane Doe', role: 'admin' })
    );
  });

  describe('getPaymentsFn', () => {
    it('returns paginated payments', async () => {
      mockApi.payment.getAll.mockResolvedValue(mockPaginated);
      const result = await getPaymentsFn();
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result and calls toast.error on failure', async () => {
      mockApi.payment.getAll.mockRejectedValue(new Error('DB error'));
      const result = await getPaymentsFn();
      expect(toast.error).toHaveBeenCalled();
      expect(result.rows).toEqual([]);
    });
  });

  describe('searchPaymentFn', () => {
    it('returns paginated payments', async () => {
      mockApi.payment.search.mockResolvedValue(mockPaginated);
      const result = await searchPaymentFn({ search: '1' });
      expect(result).toEqual(mockPaginated);
    });

    it('returns empty result on failure', async () => {
      mockApi.payment.search.mockRejectedValue(new Error('Search failed'));
      const result = await searchPaymentFn({ search: '1' });
      expect(result.rows).toEqual([]);
    });
  });

  describe('getSinglePaymentFn', () => {
    it('returns payment', async () => {
      mockApi.payment.getById.mockResolvedValue(mockPayment);
      const result = await getSinglePaymentFn(1);
      expect(result).toEqual(mockPayment);
    });

    it('returns null on failure', async () => {
      mockApi.payment.getById.mockRejectedValue(new Error('Not found'));
      const result = await getSinglePaymentFn(999);
      expect(toast.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('createPaymentFn', () => {
    it('passes postedBy from session and calls toast.success + cb', async () => {
      mockApi.payment.create.mockResolvedValue(undefined);
      const cb = vi.fn();
      await createPaymentFn({ amount: 3000, supplierId: 1 }, cb);
      expect(mockApi.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({ postedBy: 'Jane Doe' })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Payment successfully created'
      );
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('updatePaymentFn', () => {
    it('calls toast.success and cb on success', async () => {
      mockApi.payment.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updatePaymentFn({ amount: 4000 }, 1, cb);
      expect(toast.success).toHaveBeenCalledWith('Successfully updated');
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('deletePaymentFn', () => {
    it('calls toast.success on success', async () => {
      mockApi.payment.delete.mockResolvedValue(undefined);
      await deletePaymentFn(1);
      expect(toast.success).toHaveBeenCalledWith(
        'Payment successfully deleted'
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.payment.delete.mockRejectedValue(new Error('Delete failed'));
      await deletePaymentFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
