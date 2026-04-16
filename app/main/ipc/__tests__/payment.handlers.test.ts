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

vi.mock('../../../services/payment.service', () => ({
  getPaymentById: vi.fn(),
  updatePayment: vi.fn(),
}));

vi.mock('../../../models/payment', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
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

import PaymentModel from '../../../models/payment';
import SupplierModel from '../../../models/supplier';
import * as paymentService from '../../../services/payment.service';
import { registerPaymentHandlers } from '../payment.handlers';

const mockEvent = {} as any;

const mockPayment = {
  id: 1,
  amount: 3000,
  supplierId: 1,
  paymentMethod: 'cash',
  bank: null,
  note: null,
  postedBy: 'admin',
  toJSON: () => ({
    id: 1,
    amount: 3000,
    supplierId: 1,
    paymentMethod: 'cash',
  }),
  destroy: vi.fn(),
};

describe('payment IPC handlers', () => {
  beforeAll(() => {
    registerPaymentHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('payment:getAll', () => {
    it('returns paginated payments with Supplier included', async () => {
      (PaymentModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockPayment],
        count: 1,
      });
      const result = await handlers['payment:getAll'](mockEvent, {});
      expect(result).toEqual({
        rows: [mockPayment.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const callArg = (PaymentModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.include).toBeDefined();
    });
  });

  describe('payment:getById', () => {
    it('calls toJSON on the result', async () => {
      (paymentService.getPaymentById as any).mockResolvedValue(mockPayment);
      const result = await handlers['payment:getById'](mockEvent, 1);
      expect(result).toEqual(mockPayment.toJSON());
    });
  });

  describe('payment:create', () => {
    it('decrements supplier balance with amount', async () => {
      (PaymentModel.create as any).mockResolvedValue(mockPayment);
      (SupplierModel.decrement as any).mockResolvedValue(undefined);

      await handlers['payment:create'](mockEvent, {
        amount: 3000,
        supplierId: 1,
        paymentMethod: 'cash',
      });

      expect(SupplierModel.decrement).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 3000 })
      );
    });
  });

  describe('payment:update', () => {
    it('reverses old amount and applies new amount', async () => {
      const existingPayment = { ...mockPayment, amount: 2000, supplierId: 1 };
      (PaymentModel.findByPk as any).mockResolvedValue(existingPayment);
      (SupplierModel.findByPk as any).mockResolvedValue({ id: 1 });
      (SupplierModel.increment as any).mockResolvedValue(undefined);
      (SupplierModel.decrement as any).mockResolvedValue(undefined);
      (paymentService.updatePayment as any).mockResolvedValue(undefined);

      await handlers['payment:update'](mockEvent, 1, {
        amount: 3000,
        supplierId: 1,
        paymentMethod: 'cash',
      });

      expect(SupplierModel.increment).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 2000 })
      );
      expect(SupplierModel.decrement).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 3000 })
      );
    });
  });

  describe('payment:delete', () => {
    it('restores supplier balance', async () => {
      const payment = {
        ...mockPayment,
        amount: 3000,
        supplierId: 1,
        destroy: vi.fn(),
      };
      (PaymentModel.findByPk as any).mockResolvedValue(payment);
      (SupplierModel.increment as any).mockResolvedValue(undefined);

      await handlers['payment:delete'](mockEvent, 1);

      expect(SupplierModel.increment).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 3000 })
      );
    });

    it('throws if not found', async () => {
      (PaymentModel.findByPk as any).mockResolvedValue(null);
      await expect(handlers['payment:delete'](mockEvent, 999)).rejects.toThrow(
        'Payment not found'
      );
    });
  });

  describe('payment:filter', () => {
    it('filters by supplierId and date range', async () => {
      (PaymentModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockPayment],
        count: 1,
      });
      const result = await handlers['payment:filter'](mockEvent, {
        supplierId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(result.rows).toEqual([mockPayment.toJSON()]);
      const callArg = (PaymentModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where).toEqual(
        expect.objectContaining({ supplierId: 1, createdAt: expect.anything() })
      );
    });

    it('throws error when date range exceeds 90 days', async () => {
      await expect(
        handlers['payment:filter'](mockEvent, {
          startDate: '2024-01-01',
          endDate: '2024-04-01',
        })
      ).rejects.toThrow(
        'Date range too large. Please select a range smaller than 90 days.'
      );
    });
  });

  describe('payment:search', () => {
    it('searches by payment ID', async () => {
      (PaymentModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockPayment],
        count: 1,
      });
      const result = await handlers['payment:search'](mockEvent, {
        search: '1',
      });
      expect(result).toEqual({
        rows: [mockPayment.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });
  });
});
