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

vi.mock('../../../services/receipt.service', () => ({
  getReceipts: vi.fn(),
}));

vi.mock('../../../models/receipt', () => ({
  default: {
    create: vi.fn(),
    findByPk: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock('../../../models/customer', () => ({
  default: {
    findByPk: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
  },
}));

import * as receiptService from '../../../services/receipt.service';
import ReceiptModel from '../../../models/receipt';
import CustomerModel from '../../../models/customer';
import { registerReceiptHandlers } from '../receipt.handlers';

const mockEvent = {} as any;

const mockReceipt = {
  id: 1,
  amount: 500,
  customerId: 1,
  paymentMethod: 'cash',
  bank: '',
  toJSON: () => ({
    id: 1,
    amount: 500,
    customerId: 1,
    paymentMethod: 'cash',
    bank: '',
  }),
};

describe('receipt IPC handlers', () => {
  beforeAll(() => {
    registerReceiptHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('receipt:getAll', () => {
    it('returns all receipts serialized', async () => {
      (ReceiptModel.findAll as any).mockResolvedValue([mockReceipt]);
      const result = await handlers['receipt:getAll'](mockEvent);
      expect(result).toEqual([mockReceipt.toJSON()]);
    });

    it('throws on model error', async () => {
      (ReceiptModel.findAll as any).mockRejectedValue(new Error('DB error'));
      await expect(handlers['receipt:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // ------------------------------------------------------------------ create
  describe('receipt:create', () => {
    it('creates a receipt and decrements customer balance', async () => {
      (ReceiptModel.create as any).mockResolvedValue(mockReceipt);
      (CustomerModel.decrement as any).mockResolvedValue(undefined);

      await handlers['receipt:create'](mockEvent, {
        amount: 500,
        customerId: 1,
        paymentMethod: 'cash',
        bank: '',
      });

      expect(ReceiptModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          customerId: 1,
          paymentMethod: 'cash',
        }),
        expect.any(Object)
      );
      expect(CustomerModel.decrement).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 500, where: { id: 1 } })
      );
    });

    it('throws on validation error when amount is 0', async () => {
      await expect(
        handlers['receipt:create'](mockEvent, {
          amount: 0,
          customerId: 1,
          paymentMethod: 'cash',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when paymentMethod is missing', async () => {
      await expect(
        handlers['receipt:create'](mockEvent, {
          amount: 500,
          customerId: 1,
          paymentMethod: '',
        })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ delete
  describe('receipt:delete', () => {
    it('deletes a receipt and increments customer balance', async () => {
      const mockReceiptInstance = {
        amount: 500,
        customerId: 1,
        destroy: vi.fn(),
      };
      (ReceiptModel.findByPk as any).mockResolvedValue(mockReceiptInstance);
      (CustomerModel.increment as any).mockResolvedValue(undefined);

      await handlers['receipt:delete'](mockEvent, 1);

      expect(ReceiptModel.findByPk).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
      expect(CustomerModel.increment).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 500, where: { id: 1 } })
      );
      expect(mockReceiptInstance.destroy).toHaveBeenCalled();
    });

    it('throws when receipt not found', async () => {
      (ReceiptModel.findByPk as any).mockResolvedValue(null);
      await expect(
        handlers['receipt:delete'](mockEvent, 999)
      ).rejects.toThrow('Receipt not found');
    });

    it('throws on validation error when id is invalid', async () => {
      await expect(
        handlers['receipt:delete'](mockEvent, 'invalid' as any)
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ filter
  describe('receipt:filter', () => {
    it('filters receipts by date range', async () => {
      (receiptService.getReceipts as any).mockResolvedValue([mockReceipt]);
      const result = await handlers['receipt:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([mockReceipt.toJSON()]);
      const callArg = (receiptService.getReceipts as any).mock.calls[0][0];
      expect(callArg.where?.createdAt).toBeDefined();
    });

    it('filters by customerId when provided', async () => {
      (receiptService.getReceipts as any).mockResolvedValue([]);
      await handlers['receipt:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31',
        1
      );
      const callArg = (receiptService.getReceipts as any).mock.calls[0][0];
      expect(callArg.where?.customerId).toBe(1);
    });

    it('returns all receipts when no filters provided', async () => {
      (receiptService.getReceipts as any).mockResolvedValue([mockReceipt]);
      const result = await handlers['receipt:filter'](mockEvent, '', '');
      expect(result).toEqual([mockReceipt.toJSON()]);
      const callArg = (receiptService.getReceipts as any).mock.calls[0][0];
      expect(callArg.where).toBeUndefined();
    });
  });
});
