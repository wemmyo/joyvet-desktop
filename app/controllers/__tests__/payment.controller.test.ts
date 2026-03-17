vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  payment: {
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
  getPaymentsFn,
  getSinglePaymentFn,
  createPaymentFn,
  updatePaymentFn,
  deletePaymentFn,
  searchPaymentFn,
} from '../payment.controller';

const mockPayment = {
  id: 1,
  amount: 1000,
  supplierId: 1,
  paymentMethod: 'cash',
  bank: '',
  postedBy: 'admin',
};

describe('payment controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ fullName: 'admin', role: 'admin' })
    );
  });

  describe('getPaymentsFn', () => {
    it('returns all payments on success', async () => {
      mockApi.payment.getAll.mockResolvedValue([mockPayment]);
      const result = await getPaymentsFn();
      expect(result).toEqual([mockPayment]);
      expect(mockApi.payment.getAll).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.payment.getAll.mockRejectedValue(new Error('DB error'));
      await getPaymentsFn();
      expect(toast.error).toHaveBeenCalledWith('DB error');
    });
  });

  describe('getSinglePaymentFn', () => {
    it('returns a single payment by id', async () => {
      mockApi.payment.getById.mockResolvedValue(mockPayment);
      const cb = vi.fn();
      const result = await getSinglePaymentFn(1, cb);
      expect(result).toEqual(mockPayment);
      expect(mockApi.payment.getById).toHaveBeenCalledWith(1);
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.payment.getById.mockRejectedValue(new Error('Not found'));
      await getSinglePaymentFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('createPaymentFn', () => {
    it('creates a payment and calls toast.success', async () => {
      mockApi.payment.create.mockResolvedValue(mockPayment);
      const cb = vi.fn();
      await createPaymentFn(
        { amount: 1000, supplierId: 1, paymentMethod: 'cash', bank: '' },
        cb
      );
      expect(mockApi.payment.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Payment successfully created');
      expect(cb).toHaveBeenCalled();
    });

    it('passes postedBy from localStorage user', async () => {
      mockApi.payment.create.mockResolvedValue(mockPayment);
      await createPaymentFn({ amount: 1000, supplierId: 1, paymentMethod: 'cash', bank: '' });
      expect(mockApi.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({ postedBy: 'admin' })
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.payment.create.mockRejectedValue(new Error('Create failed'));
      await createPaymentFn({});
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updatePaymentFn', () => {
    it('updates a payment and calls toast.success', async () => {
      mockApi.payment.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updatePaymentFn({ amount: 2000, paymentMethod: 'bank' }, 1, cb);
      expect(mockApi.payment.update).toHaveBeenCalledWith(1, {
        amount: 2000,
        paymentMethod: 'bank',
      });
      expect(toast.success).toHaveBeenCalledWith('Successfully updated');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.payment.update.mockRejectedValue(new Error('Update failed'));
      await updatePaymentFn({ amount: 2000 }, 1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deletePaymentFn', () => {
    it('deletes a payment and calls toast.success', async () => {
      mockApi.payment.delete.mockResolvedValue(undefined);
      await deletePaymentFn(1);
      expect(mockApi.payment.delete).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Payment successfully deleted');
    });

    it('calls toast.error on failure', async () => {
      mockApi.payment.delete.mockRejectedValue(new Error('Delete failed'));
      await deletePaymentFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('searchPaymentFn', () => {
    it('returns matching payments', async () => {
      mockApi.payment.search.mockResolvedValue([mockPayment]);
      const result = await searchPaymentFn('cash');
      expect(result).toEqual([mockPayment]);
      expect(mockApi.payment.search).toHaveBeenCalledWith('cash');
    });

    it('calls toast.error on failure', async () => {
      mockApi.payment.search.mockRejectedValue(new Error('Search failed'));
      await searchPaymentFn('cash');
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
