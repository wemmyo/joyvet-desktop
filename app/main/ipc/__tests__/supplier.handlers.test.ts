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

vi.mock('../../../services/supplier.service', () => ({
  createSupplier: vi.fn(),
  getSupplierById: vi.fn(),
  updateSupplier: vi.fn(),
  deleteSupplier: vi.fn(),
}));

vi.mock('../../../models/supplier', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findAll: vi.fn(),
    sum: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../../../models/payment', () => ({
  default: {
    findAll: vi.fn(),
    count: vi.fn(),
    sum: vi.fn(),
  },
}));

vi.mock('../../../models/purchase', () => ({
  default: {
    findAll: vi.fn(),
    count: vi.fn(),
    sum: vi.fn(),
  },
}));

vi.mock('../../../models/product', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));

import PaymentModel from '../../../models/payment';
import PurchaseModel from '../../../models/purchase';
import SupplierModel from '../../../models/supplier';
import * as supplierService from '../../../services/supplier.service';
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
    // Default aggregate (SUM of balance) used by the totals feature.
    (SupplierModel.sum as any).mockResolvedValue(0);
  });

  describe('supplier:getAll', () => {
    it('returns paginated suppliers ordered by fullName', async () => {
      (SupplierModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockSupplier],
        count: 1,
      });
      const result = await handlers['supplier:getAll'](mockEvent, {});
      expect(result).toEqual({
        rows: [mockSupplier.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
        totals: { balance: 0 },
      });
      const callArg = (SupplierModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.order).toEqual([['fullName', 'ASC']]);
    });
  });

  describe('supplier:getById', () => {
    it('delegates to getSupplierById service', async () => {
      (supplierService.getSupplierById as any).mockResolvedValue(mockSupplier);
      const result = await handlers['supplier:getById'](mockEvent, 1);
      expect(supplierService.getSupplierById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSupplier.toJSON());
    });
  });

  describe('supplier:create', () => {
    it('validates fullName/phoneNumber/address and calls createSupplier', async () => {
      (supplierService.createSupplier as any).mockResolvedValue(mockSupplier);
      const result = await handlers['supplier:create'](mockEvent, {
        fullName: 'Test Supplier',
        phoneNumber: '123456789',
        address: 'Test Address',
      });
      expect(supplierService.createSupplier).toHaveBeenCalled();
      expect(result).toEqual(mockSupplier.toJSON());
    });

    it('throws on empty fullName', async () => {
      await expect(
        handlers['supplier:create'](mockEvent, {
          fullName: '',
          phoneNumber: '123456789',
          address: 'Test Address',
        })
      ).rejects.toThrow();
    });
  });

  describe('supplier:update', () => {
    it('calls updateSupplier', async () => {
      (supplierService.updateSupplier as any).mockResolvedValue(undefined);
      await handlers['supplier:update'](mockEvent, 1, {
        fullName: 'Updated Supplier',
        phoneNumber: '987654321',
        address: 'New Address',
      });
      expect(supplierService.updateSupplier).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ fullName: 'Updated Supplier' })
      );
    });
  });

  describe('supplier:delete', () => {
    it('destroys the supplier inside a transaction', async () => {
      vi.mocked(PurchaseModel.count).mockResolvedValue(0 as any);
      vi.mocked(PaymentModel.count).mockResolvedValue(0 as any);
      vi.mocked(SupplierModel.destroy).mockResolvedValue(1 as any);
      await handlers['supplier:delete'](mockEvent, 1);
      expect(SupplierModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });

    it('throws if supplier has purchases', async () => {
      vi.mocked(PurchaseModel.count).mockResolvedValue(5 as any);
      vi.mocked(PaymentModel.count).mockResolvedValue(0 as any);

      await expect(handlers['supplier:delete'](mockEvent, 1)).rejects.toThrow(
        'Cannot delete supplier with existing purchases'
      );
      expect(SupplierModel.destroy).not.toHaveBeenCalled();
    });

    it('throws if supplier has payments', async () => {
      vi.mocked(PurchaseModel.count).mockResolvedValue(0 as any);
      vi.mocked(PaymentModel.count).mockResolvedValue(1 as any);

      await expect(handlers['supplier:delete'](mockEvent, 1)).rejects.toThrow(
        'Cannot delete supplier with existing payments'
      );
      expect(SupplierModel.destroy).not.toHaveBeenCalled();
    });

    it('deletes successfully when no related records exist', async () => {
      vi.mocked(PurchaseModel.count).mockResolvedValue(0 as any);
      vi.mocked(PaymentModel.count).mockResolvedValue(0 as any);
      vi.mocked(SupplierModel.destroy).mockResolvedValue(1 as any);

      await handlers['supplier:delete'](mockEvent, 1);

      expect(SupplierModel.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });
  });

  describe('supplier:search', () => {
    it('performs substring search on fullName', async () => {
      (SupplierModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockSupplier],
        count: 1,
      });
      const result = await handlers['supplier:search'](mockEvent, {
        search: 'Test',
      });
      expect(result.rows).toEqual([mockSupplier.toJSON()]);
      const callArg = (SupplierModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where.fullName).toBeDefined();
    });

    it('returns empty result when no search term', async () => {
      const result = await handlers['supplier:search'](mockEvent, {
        search: '',
      });
      expect(result).toEqual({
        rows: [],
        total: 0,
        page: 1,
        pageSize: 25,
        totals: { balance: 0 },
      });
    });
  });

  describe('payment:getBySupplier', () => {
    it('returns payments filtered by supplierId and date range', async () => {
      const mockPayment = { id: 1, toJSON: () => ({ id: 1, supplierId: 1 }) };
      (PaymentModel.findAll as any).mockResolvedValue([mockPayment]);
      const result = await handlers['payment:getBySupplier'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([mockPayment.toJSON()]);
      expect(PaymentModel.findAll).toHaveBeenCalled();
    });
  });

  describe('purchase:getBySupplier', () => {
    it('returns purchases filtered by supplierId and date range', async () => {
      const mockPurchase = { id: 1, toJSON: () => ({ id: 1, supplierId: 1 }) };
      (PurchaseModel.findAll as any).mockResolvedValue([mockPurchase]);
      const result = await handlers['purchase:getBySupplier'](
        mockEvent,
        1,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([mockPurchase.toJSON()]);
      expect(PurchaseModel.findAll).toHaveBeenCalled();
    });
  });
});
