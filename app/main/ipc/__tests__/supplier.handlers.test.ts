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

vi.mock('../../../services/supplier.service', () => ({
  getSuppliers: vi.fn(),
  getSupplierById: vi.fn(),
  createSupplier: vi.fn(),
  updateSupplier: vi.fn(),
  deleteSupplier: vi.fn(),
}));

vi.mock('../../../models/payment', () => ({
  default: {
    findAll: vi.fn(),
  },
}));

vi.mock('../../../models/purchase', () => ({
  default: {
    findAll: vi.fn(),
  },
}));

import * as supplierService from '../../../services/supplier.service';
import PaymentModel from '../../../models/payment';
import PurchaseModel from '../../../models/purchase';
import { registerSupplierHandlers } from '../supplier.handlers';

const mockEvent = {} as any;

const mockSupplier = {
  id: 1,
  fullName: 'Test Supplier',
  phoneNumber: '123456789',
  address: 'Test Address',
  balance: 0,
  toJSON: () => ({
    id: 1,
    fullName: 'Test Supplier',
    phoneNumber: '123456789',
    address: 'Test Address',
    balance: 0,
  }),
};

describe('supplier IPC handlers', () => {
  beforeAll(() => {
    registerSupplierHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('supplier:getAll', () => {
    it('returns all suppliers serialized', async () => {
      (supplierService.getSuppliers as any).mockResolvedValue([mockSupplier]);
      const result = await handlers['supplier:getAll'](mockEvent);
      expect(result).toEqual([mockSupplier.toJSON()]);
    });

    it('orders by fullName ASC', async () => {
      (supplierService.getSuppliers as any).mockResolvedValue([]);
      await handlers['supplier:getAll'](mockEvent);
      expect(supplierService.getSuppliers).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['fullName', 'ASC']] })
      );
    });

    it('throws on service error', async () => {
      (supplierService.getSuppliers as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['supplier:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // --------------------------------------------------------------- getById
  describe('supplier:getById', () => {
    it('returns single supplier serialized', async () => {
      (supplierService.getSupplierById as any).mockResolvedValue(mockSupplier);
      const result = await handlers['supplier:getById'](mockEvent, 1);
      expect(result).toEqual(mockSupplier.toJSON());
    });

    it('throws on service error', async () => {
      (supplierService.getSupplierById as any).mockRejectedValue(
        new Error('Not found')
      );
      await expect(
        handlers['supplier:getById'](mockEvent, 1)
      ).rejects.toThrow('Not found');
    });
  });

  // ------------------------------------------------------------------ create
  describe('supplier:create', () => {
    it('creates a supplier and returns serialized result', async () => {
      (supplierService.createSupplier as any).mockResolvedValue(mockSupplier);
      const result = await handlers['supplier:create'](mockEvent, {
        fullName: 'Test Supplier',
        phoneNumber: '123456789',
        address: 'Test Address',
      });
      expect(supplierService.createSupplier).toHaveBeenCalled();
      expect(result).toEqual(mockSupplier.toJSON());
    });

    it('throws on validation error when fullName is empty', async () => {
      await expect(
        handlers['supplier:create'](mockEvent, {
          fullName: '',
          phoneNumber: '123',
          address: 'Addr',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when fullName is missing', async () => {
      await expect(
        handlers['supplier:create'](mockEvent, {
          phoneNumber: '123',
          address: 'Addr',
        })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ update
  describe('supplier:update', () => {
    it('updates a supplier', async () => {
      (supplierService.updateSupplier as any).mockResolvedValue([1]);
      await handlers['supplier:update'](mockEvent, 1, {
        fullName: 'Updated Name',
        phoneNumber: '987654321',
        address: 'New Address',
      });
      expect(supplierService.updateSupplier).toHaveBeenCalledWith(1, {
        fullName: 'Updated Name',
        phoneNumber: '987654321',
        address: 'New Address',
      });
    });

    it('throws on validation error when fullName is empty', async () => {
      await expect(
        handlers['supplier:update'](mockEvent, 1, {
          fullName: '',
          phoneNumber: '123',
          address: 'Addr',
        })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ delete
  describe('supplier:delete', () => {
    it('deletes a supplier', async () => {
      (supplierService.deleteSupplier as any).mockResolvedValue(1);
      await handlers['supplier:delete'](mockEvent, 1);
      expect(supplierService.deleteSupplier).toHaveBeenCalledWith(1);
    });
  });

  // ------------------------------------------------------------------ search
  describe('supplier:search', () => {
    it('returns matching suppliers', async () => {
      (supplierService.getSuppliers as any).mockResolvedValue([mockSupplier]);
      const result = await handlers['supplier:search'](mockEvent, 'Test');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockSupplier.toJSON()]);
    });

    it('passes a substring where clause', async () => {
      (supplierService.getSuppliers as any).mockResolvedValue([]);
      await handlers['supplier:search'](mockEvent, 'Query');
      const callArg = (supplierService.getSuppliers as any).mock.calls[0][0];
      expect(callArg.where).toBeDefined();
      expect(callArg.where.fullName).toBeDefined();
    });

    it('throws on empty search string', async () => {
      await expect(
        handlers['supplier:search'](mockEvent, '')
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------- payment:getBySupplier
  describe('payment:getBySupplier', () => {
    it('returns payments for a supplier in date range', async () => {
      const mockPayment = { toJSON: () => ({ id: 1, supplierId: 1, amount: 500 }) };
      (PaymentModel.findAll as any).mockResolvedValue([mockPayment]);
      const result = await handlers['payment:getBySupplier'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([{ id: 1, supplierId: 1, amount: 500 }]);
    });

    it('throws on validation error when supplierId is invalid', async () => {
      await expect(
        handlers['payment:getBySupplier'](
          mockEvent,
          'invalid',
          '2024-01-01',
          '2024-01-31'
        )
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------- purchase:getBySupplier
  describe('purchase:getBySupplier', () => {
    it('returns purchases for a supplier in date range', async () => {
      const mockPurchase = { toJSON: () => ({ id: 2, supplierId: 1, amount: 2000 }) };
      (PurchaseModel.findAll as any).mockResolvedValue([mockPurchase]);
      const result = await handlers['purchase:getBySupplier'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([{ id: 2, supplierId: 1, amount: 2000 }]);
    });

    it('throws on validation error when supplierId is invalid', async () => {
      await expect(
        handlers['purchase:getBySupplier'](
          mockEvent,
          'invalid',
          '2024-01-01',
          '2024-01-31'
        )
      ).rejects.toThrow();
    });
  });
});
