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

jest.mock('../../database', () => ({
  default: {
    transaction: jest.fn((cb: Function) => cb({})),
    sync: jest.fn(),
  },
}));

jest.mock('../../../services/product.service', () => ({
  getProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock('../../../services/purchaseItem.service', () => ({
  getPurchaseItems: jest.fn(),
}));

jest.mock('../../../services/invoiceItem.service', () => ({
  getInvoiceItems: jest.fn(),
}));

import * as productService from '../../../services/product.service';
import * as invoiceItemService from '../../../services/invoiceItem.service';
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
    jest.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('product:getAll', () => {
    it('returns all products serialized', async () => {
      (productService.getProducts as jest.Mock).mockResolvedValue([mockProduct]);
      const result = await handlers['product:getAll'](mockEvent);
      expect(result).toEqual([mockProduct.toJSON()]);
    });

    it('orders by title ASC', async () => {
      (productService.getProducts as jest.Mock).mockResolvedValue([]);
      await handlers['product:getAll'](mockEvent);
      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['title', 'ASC']] })
      );
    });

    it('filters in-stock products when filter is "inStock"', async () => {
      (productService.getProducts as jest.Mock).mockResolvedValue([mockProduct]);
      await handlers['product:getAll'](mockEvent, 'inStock');
      expect(productService.getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Object) })
      );
    });

    it('does not add a where clause when no filter is provided', async () => {
      (productService.getProducts as jest.Mock).mockResolvedValue([]);
      await handlers['product:getAll'](mockEvent);
      const callArg = (productService.getProducts as jest.Mock).mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });

    it('throws on service error', async () => {
      (productService.getProducts as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['product:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getById
  describe('product:getById', () => {
    it('returns single product serialized', async () => {
      (productService.getProductById as jest.Mock).mockResolvedValue(
        mockProduct
      );
      const result = await handlers['product:getById'](mockEvent, 1);
      expect(result).toEqual(mockProduct.toJSON());
    });
  });

  // ------------------------------------------------------------------ create
  describe('product:create', () => {
    it('creates a product with valid data', async () => {
      (productService.createProduct as jest.Mock).mockResolvedValue(undefined);
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
      (productService.updateProduct as jest.Mock).mockResolvedValue([1]);
      await handlers['product:update'](mockEvent, 1, { sellPrice: 600 });
      expect(productService.updateProduct).toHaveBeenCalledWith(1, {
        sellPrice: 600,
      });
    });
  });

  // ------------------------------------------------------------------ delete
  describe('product:delete', () => {
    it('deletes a product', async () => {
      (productService.deleteProduct as jest.Mock).mockResolvedValue(1);
      await handlers['product:delete'](mockEvent, 1);
      expect(productService.deleteProduct).toHaveBeenCalledWith(1);
    });
  });

  // ------------------------------------------------------------------ search
  describe('product:search', () => {
    it('returns matching products', async () => {
      (productService.getProducts as jest.Mock).mockResolvedValue([mockProduct]);
      const result = await handlers['product:search'](mockEvent, 'Test');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockProduct.toJSON()]);
    });

    it('passes a substring where clause on title', async () => {
      (productService.getProducts as jest.Mock).mockResolvedValue([]);
      await handlers['product:search'](mockEvent, 'Query');
      const callArg = (productService.getProducts as jest.Mock).mock.calls[0][0];
      expect(callArg.where).toBeDefined();
      expect(callArg.where.title).toBeDefined();
    });

    it('throws on empty search string', async () => {
      await expect(
        handlers['product:search'](mockEvent, '')
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------- getInvoices
  describe('product:getInvoices', () => {
    it('returns invoice items for a product in date range', async () => {
      const mockItem = { toJSON: () => ({ id: 10, productId: 1 }) };
      (invoiceItemService.getInvoiceItems as jest.Mock).mockResolvedValue([
        mockItem,
      ]);
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
      (purchaseItemService.getPurchaseItems as jest.Mock).mockResolvedValue([
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
});
