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

vi.mock('../../../services/invoiceAuditLog.service', () => ({
  createInvoiceAuditLog: vi.fn(),
  getInvoiceAuditLogs: vi.fn(),
}));

import CustomerModel from '../../../models/customer';
import InvoiceModel from '../../../models/invoice';
import InvoiceItemModel from '../../../models/invoiceItem';
import ProductModel from '../../../models/product';
import ProductAuditLogModel from '../../../models/productAuditLog';
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
      await expect(handlers['invoice:getAll'](mockEvent, {})).rejects.toThrow(
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

      await handlers['invoice:create'](mockEvent, [], {
        customerId: 1,
        saleType: 'cash',
        amount: 5000,
        profit: 1000,
        postedBy: 'Jane',
      });

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
        buyPrice: 400, // needed for server-side profit calculation
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

      await handlers['invoice:create'](mockEvent, invoiceItems, {
        customerId: 1,
        saleType: 'cash',
        amount: 1000,
        profit: 200,
        postedBy: 'admin',
      });

      // amount and profit are now computed server-side:
      // amount = 2 * 500 = 1000, profit = 2 * (500 - 400) = 200
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

  // ------------------------------------------------------------------ delete
  describe('invoice:delete', () => {
    it('deletes invoice and restores stock', async () => {
      // Mock invoice with a product
      const mockInvoiceWithProducts = {
        ...mockInvoice,
        products: [
          {
            id: 10,
            title: 'Widget',
            stock: 5,
            invoiceItem: { quantity: 2, amount: 1000, profit: 200 },
          },
        ],
        destroy: vi.fn().mockResolvedValue(undefined),
        update: vi.fn(),
      };
      vi.mocked(InvoiceModel.findByPk).mockResolvedValue(
        mockInvoiceWithProducts as any
      );
      vi.mocked(ProductModel.increment).mockResolvedValue([1] as any);
      await handlers['invoice:delete'](mockEvent, 1);
      // Stock is now restored via atomic increment, not a direct update.
      expect(ProductModel.increment).toHaveBeenCalledWith(
        'stock',
        expect.objectContaining({ by: 2, where: { id: 10 } })
      );
      expect(mockInvoiceWithProducts.destroy).toHaveBeenCalled();
    });

    it('throws when invoice not found', async () => {
      vi.mocked(InvoiceModel.findByPk).mockResolvedValue(null as any);
      await expect(handlers['invoice:delete'](mockEvent, 999)).rejects.toThrow(
        'Invoice not found'
      );
    });

    it('decrements customer balance for credit invoices', async () => {
      const creditInvoice = {
        ...mockInvoice,
        saleType: 'credit',
        products: [],
        destroy: vi.fn().mockResolvedValue(undefined),
        update: vi.fn(),
      };
      vi.mocked(InvoiceModel.findByPk).mockResolvedValue(creditInvoice as any);
      await handlers['invoice:delete'](mockEvent, 1);
      expect(CustomerModel.decrement).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 5000, where: { id: 1 } })
      );
    });
  });

  // ------------------------------------------------------------------ addItem
  describe('invoice:addItem', () => {
    it('creates a new invoice item and updates totals', async () => {
      const inv = {
        ...mockInvoice,
        update: vi.fn().mockResolvedValue(undefined),
      };
      const prod = {
        id: 10,
        title: 'Widget',
        stock: 20,
        buyPrice: 50,
        update: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(InvoiceModel.findByPk).mockResolvedValue(inv as any);
      vi.mocked(ProductModel.findByPk).mockResolvedValue(prod as any);
      vi.mocked(InvoiceItemModel.findOne).mockResolvedValue(null as any);
      vi.mocked(InvoiceItemModel.create).mockResolvedValue({} as any);
      vi.mocked(InvoiceItemModel.findAll).mockResolvedValue([
        { amount: 1000, profit: 200 } as any,
      ]);
      await handlers['invoice:addItem'](
        mockEvent,
        { id: 1, saleType: 'cash', postedBy: 'admin' },
        {
          product: { id: 10 },
          quantity: 2,
          unitPrice: 500,
          amount: 1000,
          profit: 200,
        }
      );
      expect(InvoiceItemModel.create).toHaveBeenCalled();
      expect(inv.update).toHaveBeenCalled();
    });

    it('throws when stock is insufficient', async () => {
      const inv = { ...mockInvoice, update: vi.fn() };
      const prod = {
        id: 10,
        title: 'Widget',
        stock: 1,
        buyPrice: 50,
        update: vi.fn(),
      };
      vi.mocked(InvoiceModel.findByPk).mockResolvedValue(inv as any);
      vi.mocked(ProductModel.findByPk).mockResolvedValue(prod as any);
      await expect(
        handlers['invoice:addItem'](
          mockEvent,
          { id: 1, saleType: 'cash', postedBy: 'admin' },
          {
            product: { id: 10 },
            quantity: 5,
            unitPrice: 500,
            amount: 2500,
            profit: 500,
          }
        )
      ).rejects.toThrow('Not enough stock');
      // IMPORTANT: because stock guard fires before writes, InvoiceItem.create must NOT have been called
      expect(InvoiceItemModel.create).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------- updateItem
  describe('invoice:updateItem', () => {
    it('updates quantity and adjusts stock and invoice totals', async () => {
      const inv = {
        ...mockInvoice,
        update: vi.fn().mockResolvedValue(undefined),
      };
      const item = {
        id: 1,
        quantity: 2,
        unitPrice: 500,
        amount: 1000,
        profit: 200,
        update: vi.fn().mockResolvedValue(undefined),
      };
      const prod = { id: 10, stock: 20, buyPrice: 50 };
      vi.mocked(InvoiceModel.findByPk).mockResolvedValue(inv as any);
      vi.mocked(InvoiceItemModel.findByPk).mockResolvedValue(item as any);
      vi.mocked(ProductModel.findByPk).mockResolvedValue(prod as any);
      vi.mocked(ProductModel.decrement).mockResolvedValue([1] as any);
      vi.mocked(InvoiceItemModel.findAll).mockResolvedValue([
        { amount: 1500, profit: 300 } as any,
      ]);
      await handlers['invoice:updateItem'](mockEvent, {
        invoiceItemId: 1,
        invoiceId: 1,
        productId: 10,
        newQuantity: 3,
        postedBy: 'admin',
      });
      expect(item.update).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 }),
        expect.anything()
      );
      // delta = 3 - 2 = 1 (positive), so stock is decremented atomically
      expect(ProductModel.decrement).toHaveBeenCalledWith(
        'stock',
        expect.objectContaining({ by: 1, where: { id: 10 } })
      );
    });
  });

  // --------------------------------------------------------------- deleteItem
  describe('invoice:deleteItem', () => {
    it('removes item and restores stock', async () => {
      const inv = {
        ...mockInvoice,
        update: vi.fn().mockResolvedValue(undefined),
      };
      const item = {
        id: 1,
        quantity: 2,
        amount: 1000,
        profit: 200,
        destroy: vi.fn().mockResolvedValue(undefined),
      };
      const prod = { id: 10, title: 'Widget', stock: 5 };
      vi.mocked(InvoiceModel.findByPk).mockResolvedValue(inv as any);
      vi.mocked(InvoiceItemModel.findByPk).mockResolvedValue(item as any);
      vi.mocked(ProductModel.findByPk).mockResolvedValue(prod as any);
      vi.mocked(ProductModel.increment).mockResolvedValue([1] as any);
      await handlers['invoice:deleteItem'](mockEvent, {
        productId: 10,
        invoiceId: 1,
        invoiceItemId: 1,
      });
      // Stock is now restored via atomic increment, not a direct update.
      expect(ProductModel.increment).toHaveBeenCalledWith(
        'stock',
        expect.objectContaining({ by: 2, where: { id: 10 } })
      );
      expect(item.destroy).toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------ getAuditLog
  describe('invoice:getAuditLog', () => {
    it('calls getInvoiceAuditLogs with the invoiceId', async () => {
      const { getInvoiceAuditLogs } = await import(
        '../../../services/invoiceAuditLog.service'
      );
      vi.mocked(getInvoiceAuditLogs).mockResolvedValue([]);
      await handlers['invoice:getAuditLog'](mockEvent, 42);
      expect(getInvoiceAuditLogs).toHaveBeenCalledWith(42);
    });
  });
});
