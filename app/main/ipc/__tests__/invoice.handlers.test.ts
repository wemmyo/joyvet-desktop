const handlers: Record<string, Function> = {};

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: jest.fn(),
  },
  app: { getPath: () => '/tmp/test', quit: jest.fn() },
  dialog: {
    showOpenDialogSync: jest.fn(() => ['/tmp/test.db']),
    showSaveDialogSync: jest.fn(() => '/tmp/test.db'),
  },
}));

// Mock database before it is imported by the handler module
jest.mock('../../database', () => ({
  default: {
    transaction: jest.fn((cb: Function) => cb({})),
    sync: jest.fn(),
  },
}));

// Mock services so models/sequelize are never loaded
jest.mock('../../../services/invoice.service', () => ({
  getInvoices: jest.fn(),
  getInvoiceById: jest.fn(),
}));

// Mock every model the handler imports directly
jest.mock('../../../models/invoice', () => ({
  default: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));
jest.mock('../../../models/customer', () => ({
  default: {
    findByPk: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  },
}));
jest.mock('../../../models/product', () => ({
  default: {
    findByPk: jest.fn(),
    update: jest.fn(),
    decrement: jest.fn(),
    increment: jest.fn(),
  },
}));
jest.mock('../../../models/invoiceItem', () => ({
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../../../sliceValidation/index', () => ({
  createInvoiceValidation: jest.fn(),
}));

import * as invoiceService from '../../../services/invoice.service';
import { registerInvoiceHandlers } from '../invoice.handlers';

const mockEvent = {} as any;

const mockInvoice = {
  id: 1,
  saleType: 'cash',
  amount: 5000,
  profit: 1000,
  postedBy: 'admin',
  customerId: 1,
  toJSON: () => ({
    id: 1,
    saleType: 'cash',
    amount: 5000,
    profit: 1000,
    postedBy: 'admin',
    customerId: 1,
  }),
};

describe('invoice IPC handlers', () => {
  beforeAll(() => {
    registerInvoiceHandlers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('invoice:getAll', () => {
    it('returns serialized invoices', async () => {
      (invoiceService.getInvoices as jest.Mock).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:getAll'](mockEvent);
      expect(result).toEqual([mockInvoice.toJSON()]);
    });

    it('throws on service error', async () => {
      (invoiceService.getInvoices as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['invoice:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getSingle
  describe('invoice:getSingle', () => {
    it('returns single invoice', async () => {
      (invoiceService.getInvoiceById as jest.Mock).mockResolvedValue(
        mockInvoice
      );
      const result = await handlers['invoice:getSingle'](mockEvent, 1);
      expect(result).toEqual(mockInvoice.toJSON());
    });

    it('throws when invoice is not found', async () => {
      (invoiceService.getInvoiceById as jest.Mock).mockResolvedValue(null);
      // toJSON() on null will throw a TypeError
      await expect(
        handlers['invoice:getSingle'](mockEvent, 999)
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ filter
  describe('invoice:filter', () => {
    it('filters by date range and saleType "all"', async () => {
      (invoiceService.getInvoices as jest.Mock).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31',
        'all'
      );
      expect(result).toEqual([mockInvoice.toJSON()]);
    });

    it('filters by saleType only when no dates provided', async () => {
      (invoiceService.getInvoices as jest.Mock).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:filter'](
        mockEvent,
        '',
        '',
        'cash'
      );
      expect(result).toEqual([mockInvoice.toJSON()]);
      // When no dates, no where clause should be added for createdAt
      const callArg = (invoiceService.getInvoices as jest.Mock).mock.calls[0][0];
      expect(callArg.where?.createdAt).toBeUndefined();
    });

    it('passes saleType where clause when not "all"', async () => {
      (invoiceService.getInvoices as jest.Mock).mockResolvedValue([]);
      await handlers['invoice:filter'](mockEvent, '', '', 'credit');
      const callArg = (invoiceService.getInvoices as jest.Mock).mock.calls[0][0];
      expect(callArg.where).toEqual({ saleType: 'credit' });
    });

    it('throws when date range exceeds 90 days', async () => {
      await expect(
        handlers['invoice:filter'](mockEvent, '2024-01-01', '2024-06-01', 'all')
      ).rejects.toThrow('Date range too large');
    });

    it('does not throw when date range is exactly 90 days', async () => {
      (invoiceService.getInvoices as jest.Mock).mockResolvedValue([]);
      // 2024-01-01 → 2024-04-01 is 91 days; use a 90-day span instead
      await expect(
        handlers['invoice:filter'](mockEvent, '2024-01-01', '2024-03-31', 'all')
      ).resolves.not.toThrow();
    });
  });

  // --------------------------------------------------------------- filterById
  describe('invoice:filterById', () => {
    it('filters invoices by id prefix', async () => {
      (invoiceService.getInvoices as jest.Mock).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:filterById'](mockEvent, 1);
      expect(result).toEqual([mockInvoice.toJSON()]);
      expect(invoiceService.getInvoices).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Object) })
      );
    });
  });
});
