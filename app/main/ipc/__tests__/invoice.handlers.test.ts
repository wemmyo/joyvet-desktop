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

// Mock database before it is imported by the handler module
vi.mock('../../database', () => ({
  default: {
    transaction: vi.fn((cb: Function) => cb({})),
    sync: vi.fn(),
  },
}));

// Mock services so models/sequelize are never loaded
vi.mock('../../../services/invoice.service', () => ({
  getInvoices: vi.fn(),
  getInvoiceById: vi.fn(),
}));

// Mock every model the handler imports directly
vi.mock('../../../models/invoice', () => ({
  default: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
}));
vi.mock('../../../models/customer', () => ({
  default: {
    findByPk: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
  },
}));
vi.mock('../../../models/product', () => ({
  default: {
    findByPk: vi.fn(),
    update: vi.fn(),
    decrement: vi.fn(),
    increment: vi.fn(),
  },
}));
vi.mock('../../../models/invoiceItem', () => ({
  default: {
    findByPk: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock('../../../sliceValidation/index', () => ({
  createInvoiceValidation: vi.fn(),
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
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('invoice:getAll', () => {
    it('returns serialized invoices', async () => {
      (invoiceService.getInvoices as any).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:getAll'](mockEvent);
      expect(result).toEqual([mockInvoice.toJSON()]);
    });

    it('throws on service error', async () => {
      (invoiceService.getInvoices as any).mockRejectedValue(
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
      (invoiceService.getInvoiceById as any).mockResolvedValue(mockInvoice);
      const result = await handlers['invoice:getSingle'](mockEvent, 1);
      expect(result).toEqual(mockInvoice.toJSON());
    });

    it('throws when invoice is not found', async () => {
      (invoiceService.getInvoiceById as any).mockResolvedValue(null);
      // toJSON() on null will throw a TypeError
      await expect(
        handlers['invoice:getSingle'](mockEvent, 999)
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ filter
  describe('invoice:filter', () => {
    it('filters by date range and saleType "all"', async () => {
      (invoiceService.getInvoices as any).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31',
        'all'
      );
      expect(result).toEqual([mockInvoice.toJSON()]);
    });

    it('filters by saleType only when no dates provided', async () => {
      (invoiceService.getInvoices as any).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:filter'](
        mockEvent,
        '',
        '',
        'cash'
      );
      expect(result).toEqual([mockInvoice.toJSON()]);
      // When no dates, no where clause should be added for createdAt
      const callArg = (invoiceService.getInvoices as any).mock.calls[0][0];
      expect(callArg.where?.createdAt).toBeUndefined();
    });

    it('passes saleType where clause when not "all"', async () => {
      (invoiceService.getInvoices as any).mockResolvedValue([]);
      await handlers['invoice:filter'](mockEvent, '', '', 'credit');
      const callArg = (invoiceService.getInvoices as any).mock.calls[0][0];
      expect(callArg.where).toEqual({ saleType: 'credit' });
    });

    it('throws when date range exceeds 90 days', async () => {
      await expect(
        handlers['invoice:filter'](mockEvent, '2024-01-01', '2024-06-01', 'all')
      ).rejects.toThrow('Date range too large');
    });

    it('does not throw when date range is exactly 90 days', async () => {
      (invoiceService.getInvoices as any).mockResolvedValue([]);
      await expect(
        handlers['invoice:filter'](mockEvent, '2024-01-01', '2024-03-31', 'all')
      ).resolves.not.toThrow();
    });
  });

  // --------------------------------------------------------------- filterById
  describe('invoice:filterById', () => {
    it('filters invoices by id prefix', async () => {
      (invoiceService.getInvoices as any).mockResolvedValue([mockInvoice]);
      const result = await handlers['invoice:filterById'](mockEvent, 1);
      expect(result).toEqual([mockInvoice.toJSON()]);
      expect(invoiceService.getInvoices).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Object) })
      );
    });
  });
});
