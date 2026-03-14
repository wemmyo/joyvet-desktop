vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  invoice: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteItem: vi.fn(),
    addItem: vi.fn(),
    filter: vi.fn(),
    filterById: vi.fn(),
    getSingle: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  getInvoicesFn,
  filterInvoiceFn,
  deleteInvoiceFn,
  createInvoiceFn,
} from '../invoice.controller';

const mockInvoice = {
  id: 1,
  saleType: 'cash',
  amount: 5000,
  profit: 1000,
  postedBy: 'admin',
  customerId: 1,
  createdAt: new Date('2024-01-01').toISOString(),
};

describe('invoice controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ fullName: 'admin', role: 'admin' })
    );
  });

  describe('getInvoicesFn', () => {
    it('returns all invoices', async () => {
      mockApi.invoice.getAll.mockResolvedValue([mockInvoice]);
      const result = await getInvoicesFn();
      expect(result).toEqual([mockInvoice]);
    });

    it('calls toast.error on failure', async () => {
      mockApi.invoice.getAll.mockRejectedValue(new Error('DB error'));
      await getInvoicesFn();
      expect(toast.error).toHaveBeenCalledWith('DB error');
    });
  });

  describe('filterInvoiceFn', () => {
    it('filters invoices by date range and saleType all', async () => {
      mockApi.invoice.filter.mockResolvedValue([mockInvoice]);
      const result = await filterInvoiceFn('2024-01-01', '2024-01-31', 'all');
      expect(result).toEqual([mockInvoice]);
    });

    it('filters invoices by saleType only', async () => {
      mockApi.invoice.filter.mockResolvedValue([mockInvoice]);
      const result = await filterInvoiceFn('', '', 'cash');
      expect(result).toEqual([mockInvoice]);
    });

    it('calls toast.error and rethrows on failure', async () => {
      mockApi.invoice.filter.mockRejectedValue(
        new Error('Date range too large')
      );
      await expect(
        filterInvoiceFn('2024-01-01', '2024-06-01', 'all')
      ).rejects.toThrow('Date range too large');
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deleteInvoiceFn', () => {
    it('deletes invoice and calls toast.success', async () => {
      mockApi.invoice.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteInvoiceFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith(
        'Invoice deleted successfully.'
      );
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('createInvoiceFn', () => {
    it('creates invoice and calls toast.success', async () => {
      mockApi.invoice.create.mockResolvedValue({ id: 2 });
      const cb = vi.fn();
      const invoiceItems = [
        {
          quantity: 1,
          unitPrice: 500,
          amount: 500,
          profit: 200,
          product: { id: 1 },
        },
      ];
      await createInvoiceFn(
        invoiceItems as any,
        { customerId: 1, saleType: 'cash', amount: 500, profit: 200 } as any,
        cb
      );
      expect(toast.success).toHaveBeenCalledWith('Invoice created');
    });
  });
});
