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

vi.mock('../../../services/purchase.service', () => ({
  getPurchaseById: vi.fn(),
}));

vi.mock('../../../models/purchase', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));

vi.mock('../../../models/supplier', () => ({
  default: {
    findByPk: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
  },
}));

vi.mock('../../../models/product', () => ({
  default: {
    findByPk: vi.fn(),
    increment: vi.fn(),
    update: vi.fn(),
    decrement: vi.fn(),
  },
}));

vi.mock('../../../models/purchaseItem', () => ({
  default: { create: vi.fn(), findAll: vi.fn() },
}));

vi.mock('../../../models/productAuditLog', () => ({
  default: { create: vi.fn() },
}));

import ProductModel from '../../../models/product';
import PurchaseModel from '../../../models/purchase';
import SupplierModel from '../../../models/supplier';
import * as purchaseService from '../../../services/purchase.service';
import { registerPurchaseHandlers } from '../purchase.handlers';

const mockEvent = {} as any;

const mockPurchase = {
  id: 1,
  invoiceNumber: 'INV-001',
  amount: 5000,
  supplierId: 1,
  postedBy: 'Jane Doe',
  products: [],
  toJSON: () => ({
    id: 1,
    invoiceNumber: 'INV-001',
    amount: 5000,
    supplierId: 1,
    postedBy: 'Jane Doe',
  }),
};

describe('purchase IPC handlers', () => {
  beforeAll(() => {
    registerPurchaseHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('purchase:getAll', () => {
    it('returns paginated purchases', async () => {
      (PurchaseModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockPurchase],
        count: 1,
      });
      const result = await handlers['purchase:getAll'](mockEvent, {});
      expect(result).toEqual({
        rows: [mockPurchase.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });
  });

  describe('purchase:getById', () => {
    it('calls toJSON on the result', async () => {
      (purchaseService.getPurchaseById as any).mockResolvedValue(mockPurchase);
      const result = await handlers['purchase:getById'](mockEvent, 1);
      expect(result).toEqual(mockPurchase.toJSON());
    });
  });

  describe('purchase:create', () => {
    it('calls createPurchase with postedBy, invoiceNumber, amount; increments supplier balance', async () => {
      const createPurchaseMock = vi.fn().mockResolvedValue({
        addProducts: vi.fn(),
        toJSON: vi.fn().mockReturnValue({}),
      });
      (SupplierModel.findByPk as any).mockResolvedValue({
        createPurchase: createPurchaseMock,
      });
      (SupplierModel.increment as any).mockResolvedValue(undefined);

      await handlers['purchase:create'](mockEvent, [], {
        supplierId: 1,
        invoiceNumber: 'INV-001',
        amount: 5000,
        postedBy: 'Jane Doe',
      });

      expect(createPurchaseMock).toHaveBeenCalledWith(
        expect.objectContaining({
          postedBy: 'Jane Doe',
          invoiceNumber: 'INV-001',
          amount: 5000,
        }),
        expect.anything()
      );
      expect(SupplierModel.increment).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 5000 })
      );
    });

    it('throws on missing invoiceNumber', async () => {
      await expect(
        handlers['purchase:create'](mockEvent, [], {
          supplierId: 1,
          amount: 5000,
          invoiceNumber: '',
        })
      ).rejects.toThrow();
    });
  });

  describe('purchase:delete', () => {
    it('throws when purchase not found', async () => {
      (PurchaseModel.findByPk as any).mockResolvedValue(null);
      await expect(handlers['purchase:delete'](mockEvent, 999)).rejects.toThrow(
        'Purchase not found'
      );
    });
  });

  describe('purchase:filter', () => {
    it('filters by supplierId', async () => {
      (PurchaseModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockPurchase],
        count: 1,
      });
      const result = await handlers['purchase:filter'](mockEvent, {
        supplierId: 1,
      });
      expect(result).toEqual({
        rows: [mockPurchase.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const callArg = (PurchaseModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where).toEqual(expect.objectContaining({ supplierId: 1 }));
    });
  });

  describe('purchase:search', () => {
    it('returns empty when no search term', async () => {
      const result = await handlers['purchase:search'](mockEvent, {
        search: '',
      });
      expect(result).toEqual({ rows: [], total: 0, page: 1, pageSize: 25 });
    });
  });
});
