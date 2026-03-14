const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
  app: { getPath: () => '/tmp/test', quit: vi.fn() },
  dialog: {
    showOpenDialogSync: vi.fn(() => ['/tmp/test.db']),
    showSaveDialogSync: vi.fn(() => '/tmp/test.db'),
  },
}));

vi.mock('../../database', () => ({
  default: {
    transaction: vi.fn((cb: Function) => cb({})),
    sync: vi.fn(),
  },
}));

vi.mock('../../../services/customer.service', () => ({
  getCustomers: vi.fn(),
  getCustomerById: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}));

vi.mock('../../../services/receipt.service', () => ({
  getReceipts: vi.fn(),
}));

vi.mock('../../../services/invoice.service', () => ({
  getInvoices: vi.fn(),
  getInvoiceById: vi.fn(),
  createInvoice: vi.fn(),
  updateInvoice: vi.fn(),
  deleteInvoice: vi.fn(),
}));

import * as customerService from '../../../services/customer.service';
import * as invoiceService from '../../../services/invoice.service';
import * as receiptService from '../../../services/receipt.service';
import { registerCustomerHandlers } from '../customer.handlers';

const mockEvent = {} as any;

const mockCustomer = {
  id: 1,
  fullName: 'Test Customer',
  phoneNumber: '123456789',
  address: 'Test Address',
  balance: 0,
  postedBy: 'admin',
  toJSON: () => ({
    id: 1,
    fullName: 'Test Customer',
    phoneNumber: '123456789',
    address: 'Test Address',
    balance: 0,
  }),
};

describe('customer IPC handlers', () => {
  beforeAll(() => {
    registerCustomerHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('customer:getAll', () => {
    it('returns all customers serialized', async () => {
      (customerService.getCustomers as any).mockResolvedValue([mockCustomer]);
      const result = await handlers['customer:getAll'](mockEvent);
      expect(result).toEqual([mockCustomer.toJSON()]);
    });

    it('orders by fullName ASC', async () => {
      (customerService.getCustomers as any).mockResolvedValue([]);
      await handlers['customer:getAll'](mockEvent);
      expect(customerService.getCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['fullName', 'ASC']] })
      );
    });

    it('throws on service error', async () => {
      (customerService.getCustomers as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['customer:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getById
  describe('customer:getById', () => {
    it('returns single customer serialized', async () => {
      (customerService.getCustomerById as any).mockResolvedValue(mockCustomer);
      const result = await handlers['customer:getById'](mockEvent, 1);
      expect(result).toEqual(mockCustomer.toJSON());
    });
  });

  // ------------------------------------------------------------------ create
  describe('customer:create', () => {
    it('creates a customer and returns serialized result', async () => {
      (customerService.createCustomer as any).mockResolvedValue(mockCustomer);
      const result = await handlers['customer:create'](mockEvent, {
        fullName: 'Test Customer',
        phoneNumber: '123456789',
        address: 'Test Address',
      });
      expect(customerService.createCustomer).toHaveBeenCalled();
      expect(result).toEqual(mockCustomer.toJSON());
    });

    it('accepts optional phoneNumber and address', async () => {
      (customerService.createCustomer as any).mockResolvedValue(mockCustomer);
      await handlers['customer:create'](mockEvent, { fullName: 'Name Only' });
      expect(customerService.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Name Only' })
      );
    });

    it('throws on validation error when fullName is empty', async () => {
      await expect(
        handlers['customer:create'](mockEvent, { fullName: '' })
      ).rejects.toThrow();
    });

    it('throws on validation error when fullName is missing', async () => {
      await expect(
        handlers['customer:create'](mockEvent, { phoneNumber: '123' })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ update
  describe('customer:update', () => {
    it('updates a customer', async () => {
      (customerService.updateCustomer as any).mockResolvedValue([1]);
      await handlers['customer:update'](mockEvent, 1, {
        fullName: 'Updated Name',
      });
      expect(customerService.updateCustomer).toHaveBeenCalledWith(1, {
        fullName: 'Updated Name',
      });
    });
  });

  // ------------------------------------------------------------------ delete
  describe('customer:delete', () => {
    it('deletes a customer', async () => {
      (customerService.deleteCustomer as any).mockResolvedValue(1);
      await handlers['customer:delete'](mockEvent, 1);
      expect(customerService.deleteCustomer).toHaveBeenCalledWith(1);
    });
  });

  // ------------------------------------------------------------------ search
  describe('customer:search', () => {
    it('returns matching customers', async () => {
      (customerService.getCustomers as any).mockResolvedValue([mockCustomer]);
      const result = await handlers['customer:search'](mockEvent, 'Test');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockCustomer.toJSON()]);
    });

    it('passes a substring where clause', async () => {
      (customerService.getCustomers as any).mockResolvedValue([]);
      await handlers['customer:search'](mockEvent, 'Query');
      const callArg = (customerService.getCustomers as any).mock.calls[0][0];
      expect(callArg.where).toBeDefined();
      expect(callArg.where.fullName).toBeDefined();
    });

    it('throws on empty search string', async () => {
      await expect(
        handlers['customer:search'](mockEvent, '')
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------- getInvoices
  describe('customer:getInvoices', () => {
    it('returns invoices for a customer in date range', async () => {
      const mockInv = { toJSON: () => ({ id: 10, customerId: 1 }) };
      (invoiceService.getInvoices as any).mockResolvedValue([mockInv]);
      const result = await handlers['customer:getInvoices'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([{ id: 10, customerId: 1 }]);
    });
  });

  // ---------------------------------------------------------- getReceipts
  describe('customer:getReceipts', () => {
    it('returns receipts for a customer in date range', async () => {
      const mockReceipt = { toJSON: () => ({ id: 5, customerId: 1 }) };
      (receiptService.getReceipts as any).mockResolvedValue([mockReceipt]);
      const result = await handlers['customer:getReceipts'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([{ id: 5, customerId: 1 }]);
    });
  });
});
