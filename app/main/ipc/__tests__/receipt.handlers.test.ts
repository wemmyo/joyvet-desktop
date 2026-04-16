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

vi.mock('../../../services/receipt.service', () => ({
  getReceiptById: vi.fn(),
  updateReceipt: vi.fn(),
}));

vi.mock('../../../models/receipt', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../models/customer', () => ({
  default: {
    findByPk: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
  },
}));

import ReceiptModel from '../../../models/receipt';
import CustomerModel from '../../../models/customer';
import * as receiptService from '../../../services/receipt.service';
import { registerReceiptHandlers } from '../receipt.handlers';

const mockEvent = {} as any;

const mockReceipt = {
  id: 1,
  amount: 2000,
  customerId: 1,
  paymentMethod: 'cash',
  bank: null,
  note: null,
  postedBy: 'admin',
  toJSON: () => ({
    id: 1,
    amount: 2000,
    customerId: 1,
    paymentMethod: 'cash',
  }),
  destroy: vi.fn(),
};

describe('receipt IPC handlers', () => {
  beforeAll(() => {
    registerReceiptHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('receipt:getAll', () => {
    it('returns paginated receipts with Customer included', async () => {
      (ReceiptModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockReceipt],
        count: 1,
      });
      const result = await handlers['receipt:getAll'](mockEvent, {});
      expect(result).toEqual({
        rows: [mockReceipt.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const callArg = (ReceiptModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.include).toBeDefined();
    });
  });

  describe('receipt:getById', () => {
    it('calls toJSON on the hydrated result', async () => {
      (receiptService.getReceiptById as any).mockResolvedValue(mockReceipt);
      (ReceiptModel.findByPk as any).mockResolvedValue(mockReceipt);
      const result = await handlers['receipt:getById'](mockEvent, 1);
      expect(result).toEqual(mockReceipt.toJSON());
    });
  });

  describe('receipt:create', () => {
    it('decrements customer balance with amount', async () => {
      (ReceiptModel.create as any).mockResolvedValue(mockReceipt);
      (CustomerModel.decrement as any).mockResolvedValue(undefined);

      await handlers['receipt:create'](mockEvent, {
        amount: 2000,
        customerId: 1,
        paymentMethod: 'cash',
      });

      expect(CustomerModel.decrement).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 2000 })
      );
    });
  });

  describe('receipt:update', () => {
    it('reverses old amount and applies new amount', async () => {
      const existingReceipt = { ...mockReceipt, amount: 1500, customerId: 1 };
      (ReceiptModel.findByPk as any).mockResolvedValue(existingReceipt);
      (CustomerModel.findByPk as any).mockResolvedValue({ id: 1 });
      (CustomerModel.increment as any).mockResolvedValue(undefined);
      (CustomerModel.decrement as any).mockResolvedValue(undefined);
      (receiptService.updateReceipt as any).mockResolvedValue(undefined);

      await handlers['receipt:update'](mockEvent, 1, {
        amount: 2000,
        customerId: 1,
        paymentMethod: 'cash',
      });

      expect(CustomerModel.increment).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 1500 })
      );
      expect(CustomerModel.decrement).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 2000 })
      );
    });
  });

  describe('receipt:delete', () => {
    it('restores customer balance', async () => {
      const receipt = {
        ...mockReceipt,
        amount: 2000,
        customerId: 1,
        destroy: vi.fn(),
      };
      (ReceiptModel.findByPk as any).mockResolvedValue(receipt);
      (CustomerModel.increment as any).mockResolvedValue(undefined);

      await handlers['receipt:delete'](mockEvent, 1);

      expect(CustomerModel.increment).toHaveBeenCalledWith(
        'balance',
        expect.objectContaining({ by: 2000 })
      );
    });

    it('throws if not found', async () => {
      (ReceiptModel.findByPk as any).mockResolvedValue(null);
      await expect(handlers['receipt:delete'](mockEvent, 999)).rejects.toThrow(
        'Receipt not found'
      );
    });
  });

  describe('receipt:filter', () => {
    it('filters by customerId and date range', async () => {
      (ReceiptModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockReceipt],
        count: 1,
      });
      const result = await handlers['receipt:filter'](mockEvent, {
        customerId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(result.rows).toEqual([mockReceipt.toJSON()]);
      const callArg = (ReceiptModel.findAndCountAll as any).mock.calls[0][0];
      expect(callArg.where).toEqual(
        expect.objectContaining({ customerId: 1, createdAt: expect.anything() })
      );
    });

    it('throws error when date range exceeds 90 days', async () => {
      await expect(
        handlers['receipt:filter'](mockEvent, {
          startDate: '2024-01-01',
          endDate: '2024-04-01',
        })
      ).rejects.toThrow(
        'Date range too large. Please select a range smaller than 90 days.'
      );
    });
  });

  describe('receipt:search', () => {
    it('searches by receipt ID', async () => {
      (ReceiptModel.findAndCountAll as any).mockResolvedValue({
        rows: [mockReceipt],
        count: 1,
      });
      const result = await handlers['receipt:search'](mockEvent, {
        search: '1',
      });
      expect(result).toEqual({
        rows: [mockReceipt.toJSON()],
        total: 1,
        page: 1,
        pageSize: 25,
      });
    });
  });
});
