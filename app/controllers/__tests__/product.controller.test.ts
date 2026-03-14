vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  product: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    getInvoices: vi.fn(),
    getPurchases: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  getProductsFn,
  createProductFn,
  updateProductFn,
  deleteProductFn,
  getSingleProductFn,
  searchProductFn,
} from '../product.controller';

const mockProduct = {
  id: 1,
  title: 'Test Product',
  stock: 100,
  sellPrice: 500,
  sellPrice2: 480,
  sellPrice3: 460,
  buyPrice: 300,
  reorderLevel: 10,
  productCode: 'TP001',
  numberInPack: 1,
  postedBy: 'admin',
};

describe('product controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ fullName: 'admin', role: 'admin' })
    );
  });

  describe('getProductsFn', () => {
    it('returns all products', async () => {
      mockApi.product.getAll.mockResolvedValue([mockProduct]);
      const result = await getProductsFn();
      expect(result).toEqual([mockProduct]);
    });

    it('returns in-stock products when filter is inStock', async () => {
      mockApi.product.getAll.mockResolvedValue([mockProduct]);
      await getProductsFn('inStock');
      expect(mockApi.product.getAll).toHaveBeenCalledWith('inStock');
    });
  });

  describe('createProductFn', () => {
    it('creates a product and shows success toast', async () => {
      mockApi.product.create.mockResolvedValue(undefined);
      const cb = vi.fn();
      await createProductFn(
        {
          title: 'Test',
          sellPrice: 500,
          sellPrice2: 480,
          sellPrice3: 460,
          buyPrice: 300,
        },
        cb
      );
      expect(toast.success).toHaveBeenCalledWith('Successfully created');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.product.create.mockRejectedValue(new Error('Create failed'));
      await createProductFn({ title: 'Test' });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deleteProductFn', () => {
    it('deletes a product and shows success toast', async () => {
      mockApi.product.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteProductFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted');
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('searchProductFn', () => {
    it('returns matching products', async () => {
      mockApi.product.search.mockResolvedValue([mockProduct]);
      const result = await searchProductFn('Test');
      expect(result).toEqual([mockProduct]);
    });
  });
});
