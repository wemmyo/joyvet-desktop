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

vi.mock('../../database', () => ({
  default: {
    transaction: vi.fn((cb: Function) => cb({})),
    sync: vi.fn(),
  },
}));

vi.mock('../../../utils/database', () => ({
  default: {},
}));

vi.mock('../../../models/productAuditLog', () => ({
  default: { create: vi.fn(), findAll: vi.fn() },
}));

vi.mock('../../../services/product.service', () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock('../../../models/product', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    update: vi.fn(),
    decrement: vi.fn(),
    increment: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../../../services/purchaseItem.service', () => ({
  getPurchaseItems: vi.fn(),
}));

vi.mock('../../../services/invoiceItem.service', () => ({
  getInvoiceItems: vi.fn(),
}));

vi.mock('../../../models/invoiceItem', () => ({
  default: { count: vi.fn() },
}));

vi.mock('../../../models/purchaseItem', () => ({
  default: { count: vi.fn() },
}));

import InvoiceItemModel from '../../../models/invoiceItem';
import ProductModel from '../../../models/product';
import ProductAuditLogModel from '../../../models/productAuditLog';
import PurchaseItemModel from '../../../models/purchaseItem';
import * as invoiceItemService from '../../../services/invoiceItem.service';
import * as productService from '../../../services/product.service';
import * as purchaseItemService from '../../../services/purchaseItem.service';
import { registerProductHandlers } from '../product.handlers';

const mockEvent = {} as any;

const mockProduct = {
  id: 1,
  title: 'Test Product',
  stock: 100,
  sellPrice: 500,
  sellPrice2: 480,
  sellPrice3: 460,
  buyPrice: 300,
  toJSON: () => ({
    id: 1,
    title: 'Test Product',
    stock: 100,
    sellPrice: 500,
    sellPrice2: 480,
    sellPrice3: 460,
    buyPrice: 300,
  }),
};

describe('product IPC handlers', () => {
  beforeAll(() => {
    registerProductHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default aggregate (SUM of stock * buyPrice) used by the totals feature.
    (ProductModel.findOne as any).mockResolvedValue({ value: 0 });
  });

  // ------------------------------------------------------------------ getAll
  describe('product:getAll', () => {
    it('returns paginated products', async () => {
      (ProductModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockProduct],
        count: 1,
      });
      const result = await handlers['product:getAll'](mockEvent, {});
      expect(result).toEqual({
        rows: [mockProduct.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
        totals: { stockValue: 0 },
      });
    });

    it('orders by title ASC', async () => {
      (ProductModel.findAndCountAll as any).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await handlers['product:getAll'](mockEvent, {});
      expect(ProductModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['title', 'ASC']] })
      );
    });

    it('filters in-stock products when filter is "inStock"', async () => {
      (ProductModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockProduct],
        count: 1,
      });
      await handlers['product:getAll'](mockEvent, { filter: 'inStock' });
      expect(ProductModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Object) })
      );
    });

    it('does not add a where clause when no filter is provided', async () => {
      (ProductModel.findAndCountAll as any).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await handlers['product:getAll'](mockEvent, {});
      const callArg = (ProductModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });

    it('throws on db error', async () => {
      (ProductModel.findAndCountAll as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['product:getAll'](mockEvent, {})).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getById
  describe('product:getById', () => {
    it('returns single product serialized', async () => {
      (productService.getProductById as any).mockResolvedValue(mockProduct);
      const result = await handlers['product:getById'](mockEvent, 1);
      expect(result).toEqual(mockProduct.toJSON());
    });
  });

  // ------------------------------------------------------------------ create
  describe('product:create', () => {
    it('creates a product with valid data', async () => {
      (productService.createProduct as any).mockResolvedValue(undefined);
      await handlers['product:create'](mockEvent, {
        title: 'New Product',
        sellPrice: 500,
        sellPrice2: 480,
        sellPrice3: 460,
        buyPrice: 300,
      });
      expect(productService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Product' })
      );
    });

    it('throws on validation error when title is empty', async () => {
      await expect(
        handlers['product:create'](mockEvent, {
          title: '',
          sellPrice: 500,
          sellPrice2: 480,
          sellPrice3: 460,
          buyPrice: 300,
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when required numeric fields are missing', async () => {
      await expect(
        handlers['product:create'](mockEvent, { title: 'Only Title' })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ update
  describe('product:update', () => {
    it('updates a product', async () => {
      vi.mocked(ProductModel.findByPk).mockResolvedValue(mockProduct as any);
      (ProductModel.update as any).mockResolvedValue([1]);
      await handlers['product:update'](mockEvent, 1, { sellPrice: 600 });
      expect(ProductModel.update).toHaveBeenCalledWith(
        { sellPrice: 600 },
        expect.objectContaining({ where: { id: 1 } })
      );
    });
  });

  // ------------------------------------------------------------------ delete
  describe('product:delete', () => {
    it('deletes a product', async () => {
      vi.mocked(InvoiceItemModel.count).mockResolvedValue(0 as any);
      vi.mocked(PurchaseItemModel.count).mockResolvedValue(0 as any);
      vi.mocked(ProductModel.destroy).mockResolvedValue(1 as any);
      await handlers['product:delete'](mockEvent, 1);
      expect(ProductModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });

    it('throws if product has invoice items', async () => {
      vi.mocked(InvoiceItemModel.count).mockResolvedValue(4 as any);
      vi.mocked(PurchaseItemModel.count).mockResolvedValue(0 as any);

      await expect(handlers['product:delete'](mockEvent, 1)).rejects.toThrow(
        'Cannot delete product referenced by existing invoices'
      );
      expect(ProductModel.destroy).not.toHaveBeenCalled();
    });

    it('throws if product has purchase items', async () => {
      vi.mocked(InvoiceItemModel.count).mockResolvedValue(0 as any);
      vi.mocked(PurchaseItemModel.count).mockResolvedValue(2 as any);

      await expect(handlers['product:delete'](mockEvent, 1)).rejects.toThrow(
        'Cannot delete product referenced by existing purchases'
      );
      expect(ProductModel.destroy).not.toHaveBeenCalled();
    });

    it('deletes successfully when not referenced', async () => {
      vi.mocked(InvoiceItemModel.count).mockResolvedValue(0 as any);
      vi.mocked(PurchaseItemModel.count).mockResolvedValue(0 as any);
      vi.mocked(ProductModel.destroy).mockResolvedValue(1 as any);

      await handlers['product:delete'](mockEvent, 1);

      expect(ProductModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });
  });

  // ------------------------------------------------------------------ search
  describe('product:search', () => {
    it('returns matching products', async () => {
      (ProductModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockProduct],
        count: 1,
      });
      const result = await handlers['product:search'](mockEvent, {
        search: 'Test',
      });
      expect(result).toEqual({
        rows: [mockProduct.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
        totals: { stockValue: 0 },
      });
    });

    it('passes a substring where clause on title', async () => {
      (ProductModel.findAndCountAll as any).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await handlers['product:search'](mockEvent, { search: 'Query' });
      const callArg = (ProductModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where).toBeDefined();
      expect(callArg.where.title).toBeDefined();
    });

    it('keeps the in-stock filter when searching products', async () => {
      (ProductModel.findAndCountAll as any).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await handlers['product:search'](mockEvent, {
        filter: 'inStock',
        search: 'Query',
      });
      expect(ProductModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stock: expect.any(Object),
            title: expect.any(Object),
          }),
        })
      );
    });

    it('returns empty paginated result for empty search string', async () => {
      const result = await handlers['product:search'](mockEvent, {
        search: '',
      });
      expect(result).toEqual({
        rows: [],
        total: 0,
        page: 1,
        pageSize: 25,
        totals: { stockValue: 0 },
      });
    });
  });

  // ---------------------------------------------------------- getInvoices
  describe('product:getInvoices', () => {
    it('returns invoice items for a product in date range', async () => {
      const mockItem = { toJSON: () => ({ id: 10, productId: 1 }) };
      (invoiceItemService.getInvoiceItems as any).mockResolvedValue([mockItem]);
      const result = await handlers['product:getInvoices'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([{ id: 10, productId: 1 }]);
    });
  });

  // ---------------------------------------------------------- getPurchases
  describe('product:getPurchases', () => {
    it('returns purchase items for a product in date range', async () => {
      const mockItem = { toJSON: () => ({ id: 20, productId: 1 }) };
      (purchaseItemService.getPurchaseItems as any).mockResolvedValue([
        mockItem,
      ]);
      const result = await handlers['product:getPurchases'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([{ id: 20, productId: 1 }]);
    });
  });

  // ---------------------------------------------------------- getAuditLog
  describe('product:getAuditLog', () => {
    it('calls ProductAuditLog.findAll with date-range where clause', async () => {
      vi.mocked(ProductAuditLogModel.findAll).mockResolvedValue([]);
      await handlers['product:getAuditLog'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(ProductAuditLogModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productId: 1 }),
          order: [['createdAt', 'DESC']],
        })
      );
    });

    it('returns mapped toJSON results', async () => {
      const mockLog = {
        id: 1,
        changeType: 'stock_change',
        toJSON: () => ({ id: 1, changeType: 'stock_change' }),
      };
      vi.mocked(ProductAuditLogModel.findAll).mockResolvedValue([
        mockLog as any,
      ]);
      const result = await handlers['product:getAuditLog'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([{ id: 1, changeType: 'stock_change' }]);
    });
  });
});
