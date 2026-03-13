jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock window.api (provided by contextBridge in production)
const mockApi = {
  customer: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    getInvoices: jest.fn(),
    getReceipts: jest.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'react-toastify';
import {
  getCustomersFn,
  createCustomerFn,
  updateCustomerFn,
  deleteCustomerFn,
  getSingleCustomerFn,
  searchCustomerFn,
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
    jest.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({ fullName: 'admin', role: 'admin' }));
  });

  describe('getCustomersFn', () => {
    it('returns customers on success', async () => {
      mockApi.customer.getAll.mockResolvedValue([mockCustomer]);
      const result = await getCustomersFn();
      expect(result).toEqual([mockCustomer]);
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
      const cb = jest.fn();
      await createCustomerFn({ fullName: 'Test Customer', phoneNumber: '123', address: 'Addr' }, cb);
      expect(mockApi.customer.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Successfully created');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.customer.create.mockRejectedValue(new Error('Create failed'));
      await createCustomerFn({ fullName: 'Test' });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateCustomerFn', () => {
    it('updates a customer and calls toast.success', async () => {
      mockApi.customer.update.mockResolvedValue(undefined);
      const cb = jest.fn();
      await updateCustomerFn({ fullName: 'Updated', phoneNumber: '123', address: 'Addr' }, 1, cb);
      expect(toast.success).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('deleteCustomerFn', () => {
    it('deletes a customer and calls toast.success', async () => {
      mockApi.customer.delete.mockResolvedValue(undefined);
      const cb = jest.fn();
      await deleteCustomerFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted');
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('searchCustomerFn', () => {
    it('returns matching customers', async () => {
      mockApi.customer.search.mockResolvedValue([mockCustomer]);
      const result = await searchCustomerFn('Test');
      expect(result).toEqual([mockCustomer]);
    });

    it('calls toast.error on failure', async () => {
      mockApi.customer.search.mockRejectedValue(new Error('Search failed'));
      await searchCustomerFn('Test');
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
