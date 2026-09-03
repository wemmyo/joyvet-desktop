vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock window.api (provided by contextBridge in production)
const mockApi = {
  customer: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    getInvoices: vi.fn(),
    getReceipts: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  createCustomerFn,
  deleteCustomerFn,
  getCustomersFn,
  getSingleCustomerFn,
  searchCustomerFn,
  updateCustomerFn,
} from '../customer.controller';

const mockCustomer = {
  id: 1,
  fullName: 'Test Customer',
  phoneNumber: '123456789',
  address: 'Test Address',
  balance: 0,
  postedBy: 'admin',
  maxPriceLevel: 1,
};

describe('customer controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ fullName: 'admin', role: 'admin' })
    );
  });

  describe('getCustomersFn', () => {
    it('returns customers on success', async () => {
      mockApi.customer.getAll.mockResolvedValue({
        rows: [mockCustomer],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const result = await getCustomersFn();
      expect(result).toEqual({
        rows: [mockCustomer],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      expect(mockApi.customer.getAll).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.customer.getAll.mockRejectedValue(new Error('DB error'));
      await getCustomersFn();
      expect(toast.error).toHaveBeenCalledWith('DB error');
    });
  });

  describe('createCustomerFn', () => {
    it('creates a customer and calls toast.success', async () => {
      mockApi.customer.create.mockResolvedValue(mockCustomer);
      const cb = vi.fn();
      const result = await createCustomerFn(
        { fullName: 'Test Customer', phoneNumber: '123', address: 'Addr' },
        cb
      );
      expect(mockApi.customer.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Successfully created');
      expect(cb).toHaveBeenCalledWith(mockCustomer);
      expect(result).toEqual(mockCustomer);
    });

    it('calls toast.error on failure and does not run the success callback', async () => {
      mockApi.customer.create.mockRejectedValue(new Error('Create failed'));
      const cb = vi.fn();
      const result = await createCustomerFn({ fullName: 'Test' }, cb);
      expect(toast.error).toHaveBeenCalledWith('Create failed');
      expect(toast.success).not.toHaveBeenCalled();
      expect(cb).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('updateCustomerFn', () => {
    it('updates a customer and calls toast.success', async () => {
      mockApi.customer.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updateCustomerFn(
        { fullName: 'Updated', phoneNumber: '123', address: 'Addr' },
        1,
        cb
      );
      expect(toast.success).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('deleteCustomerFn', () => {
    it('deletes a customer and calls toast.success', async () => {
      mockApi.customer.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteCustomerFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted');
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('searchCustomerFn', () => {
    it('returns matching customers', async () => {
      mockApi.customer.search.mockResolvedValue({
        rows: [mockCustomer],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const result = await searchCustomerFn({ search: 'Test' });
      expect(result).toEqual({
        rows: [mockCustomer],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });

    it('calls toast.error on failure', async () => {
      mockApi.customer.search.mockRejectedValue(new Error('Search failed'));
      await searchCustomerFn({ search: 'Test' });
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
