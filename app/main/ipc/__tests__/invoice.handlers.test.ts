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

vi.mock('../../runtime', () => ({
  withAppReady: (fn: Function) => fn,
  ensureAuthReady: vi.fn(),
}));

// Mock database before it is imported by the handler module
vi.mock('../../database', () => ({
  default: {
    transaction: vi.fn((cb: Function) => cb({})),
    sync: vi.fn(),
  },
}));

// Mock services so models/sequelize are never loaded for non-paginated handlers
vi.mock('../../../services/invoice.service', () => ({
  getInvoices: vi.fn(),
  getInvoiceById: vi.fn(),
}));

// Mock every model the handler imports directly
vi.mock('../../../models/invoice', () => ({
  default: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    findAndCountAll: vi.fn(),
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
vi.mock('../../../models/productAuditLog', () => ({
  default: {
    create: vi.fn(),
  },
}));
vi.mock('../../../sliceValidation/index', () => ({
  createInvoiceValidation: vi.fn(),
}));

import InvoiceModel from '../../../models/invoice';
import CustomerModel from '../../../models/customer';
import ProductModel from '../../../models/product';
import InvoiceItemModel from '../../../models/invoiceItem';
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
    it('returns paginated invoices', async () => {
      (InvoiceModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockInvoice],
        count: 1,
      });
      const result = await handlers['invoice:getAll'](mockEvent, {});
      expect(result).toEqual({
        rows: [mockInvoice.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });

    it('throws on db error', async () => {
      (InvoiceModel.findAndCountAll as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(
        handlers['invoice:getAll'](mockEvent, {})
      ).rejects.toThrow('DB error');
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
      (InvoiceModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockInvoice],
        count: 1,
      });
      const result = await handlers['invoice:filter'](mockEvent, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        saleType: 'all',
      });
      expect(result).toEqual({
        rows: [mockInvoice.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });

    it('filters by saleType only when no dates provided', async () => {
      (InvoiceModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockInvoice],
        count: 1,
      });
      const result = await handlers['invoice:filter'](mockEvent, {
        saleType: 'cash',
      });
      expect(result).toEqual({
        rows: [mockInvoice.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      // When no dates, no where clause should be added for createdAt
      const callArg = (InvoiceModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where?.createdAt).toBeUndefined();
    });

    it('passes saleType where clause when not "all"', async () => {
      (InvoiceModel.findAndCountAll as any).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await handlers['invoice:filter'](mockEvent, { saleType: 'credit' });
      const callArg = (InvoiceModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where).toEqual({ saleType: 'credit' });
    });

    it('throws when date range exceeds 90 days', async () => {
      await expect(
        handlers['invoice:filter'](mockEvent, {
          startDate: '2024-01-01',
          endDate: '2024-06-01',
          saleType: 'all',
        })
      ).rejects.toThrow('Date range too large');
    });

    it('does not throw when date range is exactly 90 days', async () => {
      (InvoiceModel.findAndCountAll as any).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await expect(
        handlers['invoice:filter'](mockEvent, {
          startDate: '2024-01-01',
          endDate: '2024-03-31',
          saleType: 'all',
        })
      ).resolves.not.toThrow();
    });
  });

  // ------------------------------------------------------------------ create
  describe('invoice:create', () => {
    it('calls createInvoice with the correct payload including postedBy', async () => {
      const createInvoiceMock = vi.fn().mockResolvedValue({
        addProducts: vi.fn(),
        toJSON: vi.fn().mockReturnValue({}),
      });
      (CustomerModel.findByPk as any).mockResolvedValue({
        createInvoice: createInvoiceMock,
      });

      await handlers['invoice:create'](
        mockEvent,
        [],
        { customerId: 1, saleType: 'cash', amount: 5000, profit: 1000, postedBy: 'Jane' }
      );

      expect(createInvoiceMock).toHaveBeenCalledWith(
        expect.objectContaining({ postedBy: 'Jane' }),
        expect.anything()
      );
    });

    it('creates InvoiceItem records directly instead of using addProducts', async () => {
      const invoiceId = 42;
      const productId = 7;

      const mockCustomerInvoice = {
        id: invoiceId,
        toJSON: vi.fn().mockReturnValue({ id: invoiceId }),
      };

      (CustomerModel.findByPk as any).mockResolvedValue({
        createInvoice: vi.fn().mockResolvedValue(mockCustomerInvoice),
      });

      (ProductModel.findByPk as any).mockResolvedValue({
        id: productId,
        title: 'Test Product',
        stock: 10,
      });

      (ProductModel.decrement as any).mockResolvedValue(undefined);
      (InvoiceItemModel.create as any).mockResolvedValue({});

      const invoiceItems = [
        {
          product: { id: productId },
          quantity: 2,
          unitPrice: 500,
          amount: 1000,
          profit: 200,
        },
      ];

      await handlers['invoice:create'](
        mockEvent,
        invoiceItems,
        { customerId: 1, saleType: 'cash', amount: 1000, profit: 200, postedBy: 'admin' }
      );

      expect(InvoiceItemModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId,
          productId,
          quantity: 2,
          unitPrice: 500,
          amount: 1000,
          profit: 200,
        }),
        expect.anything()
      );
    });
  });

  // --------------------------------------------------------------- filterById
  describe('invoice:filterById', () => {
    it('filters invoices by id prefix', async () => {
      (InvoiceModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockInvoice],
        count: 1,
      });
      const result = await handlers['invoice:filterById'](mockEvent, {
        search: '1',
      });
      expect(result).toEqual({
        rows: [mockInvoice.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });
  });
});
