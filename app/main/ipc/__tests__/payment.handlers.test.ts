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

vi.mock('../../../services/payment.service', () => ({
  getPayments: vi.fn(),
}));

vi.mock('../../../models/payment', () => ({
  default: {
    create: vi.fn(),
    findByPk: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock('../../../models/supplier', () => ({
  default: {
    findByPk: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
  },
}));

import * as paymentService from '../../../services/payment.service';
import PaymentModel from '../../../models/payment';
import SupplierModel from '../../../models/supplier';
import { registerPaymentHandlers } from '../payment.handlers';

const mockEvent = {} as any;

const mockPayment = {
  id: 1,
  amount: 1000,
  supplierId: 1,
  paymentMethod: 'cash',
  bank: '',
  toJSON: () => ({
    id: 1,
    amount: 1000,
    supplierId: 1,
    paymentMethod: 'cash',
    bank: '',
  }),
};

describe('payment IPC handlers', () => {
  beforeAll(() => {
    registerPaymentHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('payment:getAll', () => {
    it('returns all payments serialized', async () => {
      (paymentService.getPayments as any).mockResolvedValue([mockPayment]);
      const result = await handlers['payment:getAll'](mockEvent);
      expect(result).toEqual([mockPayment.toJSON()]);
    });

    it('throws on service error', async () => {
      (paymentService.getPayments as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['payment:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // ------------------------------------------------------------------ create
  describe('payment:create', () => {
    it('creates a payment and decrements supplier balance', async () => {
      (PaymentModel.create as any).mockResolvedValue(mockPayment);
      (SupplierModel.decrement as any).mockResolvedValue(undefined);

      await handlers['payment:create'](mockEvent, {
        amount: 1000,
        supplierId: 1,
        paymentMethod: 'cash',
        bank: '',
      });

      expect(PaymentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000,
          supplierId: 1,
          paymentMethod: 'cash',
        }),
        expect.any(Object)
      );
      expect(SupplierModel.decrement).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 1000, where: { id: 1 } })
      );
    });

    it('throws on validation error when amount is 0', async () => {
      await expect(
        handlers['payment:create'](mockEvent, {
          amount: 0,
          supplierId: 1,
          paymentMethod: 'cash',
          bank: '',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when paymentMethod is missing', async () => {
      await expect(
        handlers['payment:create'](mockEvent, {
          amount: 1000,
          supplierId: 1,
          paymentMethod: '',
          bank: '',
        })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ delete
  describe('payment:delete', () => {
    it('deletes a payment and increments supplier balance', async () => {
      const mockPaymentInstance = {
        amount: 1000,
        supplierId: 1,
        destroy: vi.fn(),
      };
      (PaymentModel.findByPk as any).mockResolvedValue(mockPaymentInstance);
      (SupplierModel.increment as any).mockResolvedValue(undefined);

      await handlers['payment:delete'](mockEvent, 1);

      expect(PaymentModel.findByPk).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
      expect(SupplierModel.increment).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 1000, where: { id: 1 } })
      );
      expect(mockPaymentInstance.destroy).toHaveBeenCalled();
    });

    it('throws when payment not found', async () => {
      (PaymentModel.findByPk as any).mockResolvedValue(null);
      await expect(
        handlers['payment:delete'](mockEvent, 999)
      ).rejects.toThrow('Payment not found');
    });

    it('throws on validation error when id is invalid', async () => {
      await expect(
        handlers['payment:delete'](mockEvent, 'invalid' as any)
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ filter
  describe('payment:filter', () => {
    it('filters payments by date range', async () => {
      (paymentService.getPayments as any).mockResolvedValue([mockPayment]);
      const result = await handlers['payment:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([mockPayment.toJSON()]);
      const callArg = (paymentService.getPayments as any).mock.calls[0][0];
      expect(callArg.where?.createdAt).toBeDefined();
    });

    it('filters by supplierId when provided', async () => {
      (paymentService.getPayments as any).mockResolvedValue([]);
      await handlers['payment:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31',
        1
      );
      const callArg = (paymentService.getPayments as any).mock.calls[0][0];
      expect(callArg.where?.supplierId).toBe(1);
    });

    it('returns all payments when no filters provided', async () => {
      (paymentService.getPayments as any).mockResolvedValue([mockPayment]);
      const result = await handlers['payment:filter'](mockEvent, '', '');
      expect(result).toEqual([mockPayment.toJSON()]);
      const callArg = (paymentService.getPayments as any).mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });
  });
});
