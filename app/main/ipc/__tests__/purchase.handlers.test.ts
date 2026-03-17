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

vi.mock('../../../services/purchase.service', () => ({
  getPurchases: vi.fn(),
  getPurchaseById: vi.fn(),
}));

vi.mock('../../../models/purchase', () => ({
  default: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
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
    decrement: vi.fn(),
    update: vi.fn(),
  },
}));

import * as purchaseService from '../../../services/purchase.service';
import SupplierModel from '../../../models/supplier';
import ProductModel from '../../../models/product';
import PurchaseModel from '../../../models/purchase';
import { registerPurchaseHandlers } from '../purchase.handlers';

const mockEvent = {} as any;

const mockPurchase = {
  id: 1,
  invoiceNumber: 'INV-001',
  amount: 5000,
  supplierId: 1,
  toJSON: () => ({
    id: 1,
    invoiceNumber: 'INV-001',
    amount: 5000,
    supplierId: 1,
  }),
};

describe('purchase IPC handlers', () => {
  beforeAll(() => {
    registerPurchaseHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('purchase:getAll', () => {
    it('returns all purchases serialized', async () => {
      (purchaseService.getPurchases as any).mockResolvedValue([mockPurchase]);
      const result = await handlers['purchase:getAll'](mockEvent);
      expect(result).toEqual([mockPurchase.toJSON()]);
    });

    it('orders by createdAt DESC', async () => {
      (purchaseService.getPurchases as any).mockResolvedValue([]);
      await handlers['purchase:getAll'](mockEvent);
      expect(purchaseService.getPurchases).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['createdAt', 'DESC']] })
      );
    });

    it('throws on service error', async () => {
      (purchaseService.getPurchases as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['purchase:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getById
  describe('purchase:getById', () => {
    it('returns single purchase serialized', async () => {
      (purchaseService.getPurchaseById as any).mockResolvedValue(mockPurchase);
      const result = await handlers['purchase:getById'](mockEvent, 1);
      expect(result).toEqual(mockPurchase.toJSON());
    });

    it('throws on service error', async () => {
      (purchaseService.getPurchaseById as any).mockRejectedValue(
        new Error('Not found')
      );
      await expect(
        handlers['purchase:getById'](mockEvent, 1)
      ).rejects.toThrow('Not found');
    });
  });

  // ------------------------------------------------------------------ create
  describe('purchase:create', () => {
    it('creates a purchase via transaction', async () => {
      const mockCreatedPurchase = {
        toJSON: () => mockPurchase.toJSON(),
        addProducts: vi.fn(),
      };
      const mockSupplierInstance = {
        createPurchase: vi.fn().mockResolvedValue(mockCreatedPurchase),
      };
      const mockProductInstance = {
        id: 1,
        purchaseItem: {},
      };

      (SupplierModel.findByPk as any).mockResolvedValue(mockSupplierInstance);
      (ProductModel.findByPk as any).mockResolvedValue(mockProductInstance);
      (ProductModel.increment as any).mockResolvedValue(undefined);
      (ProductModel.update as any).mockResolvedValue(undefined);
      (SupplierModel.increment as any).mockResolvedValue(undefined);

      await handlers['purchase:create'](
        mockEvent,
        [
          {
            id: 1,
            quantity: 10,
            unitPrice: 500,
            amount: 5000,
            newSellPrice: 600,
            newSellPrice2: 650,
            newSellPrice3: 700,
            buyPrice: 480,
            sellPrice: 580,
            sellPrice2: 630,
            sellPrice3: 680,
            stock: 5,
          },
        ],
        {
          supplierId: 1,
          invoiceNumber: 'INV-001',
          amount: 5000,
        }
      );

      expect(SupplierModel.findByPk).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
    });

    it('throws on validation error when invoiceNumber is missing', async () => {
      await expect(
        handlers['purchase:create'](
          mockEvent,
          [{ id: 1, quantity: 5 }],
          { supplierId: 1, invoiceNumber: '', amount: 5000 }
        )
      ).rejects.toThrow();
    });

    it('throws on validation error when supplierId is missing', async () => {
      await expect(
        handlers['purchase:create'](
          mockEvent,
          [],
          { invoiceNumber: 'INV-002', amount: 1000 }
        )
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ delete
  describe('purchase:delete', () => {
    it('deletes a purchase via transaction', async () => {
      const mockPurchaseInstance = {
        products: [
          {
            id: 1,
            purchaseItem: {
              oldBuyPrice: 400,
              oldSellPrice: 500,
              oldSellPrice2: 550,
              oldSellPrice3: 600,
              quantity: 5,
            },
          },
        ],
        amount: 5000,
        supplierId: 1,
        destroy: vi.fn(),
      };
      (PurchaseModel.findByPk as any).mockResolvedValue(mockPurchaseInstance);
      (ProductModel.update as any).mockResolvedValue(undefined);
      (ProductModel.decrement as any).mockResolvedValue(undefined);
      (SupplierModel.decrement as any).mockResolvedValue(undefined);

      await handlers['purchase:delete'](mockEvent, 1);

      expect(PurchaseModel.findByPk).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
    });

    it('throws when purchase not found', async () => {
      (PurchaseModel.findByPk as any).mockResolvedValue(null);
      await expect(
        handlers['purchase:delete'](mockEvent, 999)
      ).rejects.toThrow('Purchase not found');
    });
  });

  // ------------------------------------------------------------------ filter
  describe('purchase:filter', () => {
    it('filters purchases by date range', async () => {
      (purchaseService.getPurchases as any).mockResolvedValue([mockPurchase]);
      const result = await handlers['purchase:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([mockPurchase.toJSON()]);
      const callArg = (purchaseService.getPurchases as any).mock.calls[0][0];
      expect(callArg.where?.createdAt).toBeDefined();
    });

    it('filters by supplierId when provided', async () => {
      (purchaseService.getPurchases as any).mockResolvedValue([]);
      await handlers['purchase:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31',
        1
      );
      const callArg = (purchaseService.getPurchases as any).mock.calls[0][0];
      expect(callArg.where?.supplierId).toBe(1);
    });

    it('returns all purchases when no filters provided', async () => {
      (purchaseService.getPurchases as any).mockResolvedValue([mockPurchase]);
      const result = await handlers['purchase:filter'](mockEvent, '', '');
      expect(result).toEqual([mockPurchase.toJSON()]);
      const callArg = (purchaseService.getPurchases as any).mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });
  });
});
