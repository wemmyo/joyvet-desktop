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
    query: vi.fn(),
    transaction: vi.fn((cb: Function) => cb({})),
    sync: vi.fn(),
  },
}));

vi.mock('../../../models/invoice', () => ({
  default: { sum: vi.fn() },
}));
vi.mock('../../../models/purchase', () => ({
  default: { sum: vi.fn() },
}));
vi.mock('../../../models/receipt', () => ({
  default: { sum: vi.fn() },
}));
vi.mock('../../../models/payment', () => ({
  default: { sum: vi.fn() },
}));
vi.mock('../../../models/expense', () => ({
  default: { sum: vi.fn() },
}));
vi.mock('../../../models/customer', () => ({
  default: { sum: vi.fn() },
}));
vi.mock('../../../models/supplier', () => ({
  default: { sum: vi.fn() },
}));

import { Op } from 'sequelize';
import Customer from '../../../models/customer';
import Expense from '../../../models/expense';
import Invoice from '../../../models/invoice';
import Payment from '../../../models/payment';
import Purchase from '../../../models/purchase';
import Receipt from '../../../models/receipt';
import Supplier from '../../../models/supplier';
import database from '../../database';
import { registerAnalyticsHandlers } from '../analytics.handlers';

const mockEvent = {} as any;
const range = { startDate: '2026-03-01', endDate: '2026-03-31' };

beforeEach(() => {
  vi.clearAllMocks();
  registerAnalyticsHandlers();
});

describe('analytics:getSummary', () => {
  const stubSums = () => {
    vi.mocked(Invoice.sum).mockResolvedValue(1000 as any);
    vi.mocked(Purchase.sum).mockResolvedValue(400 as any);
    vi.mocked(Receipt.sum).mockResolvedValue(200 as any);
    vi.mocked(Payment.sum).mockResolvedValue(150 as any);
    vi.mocked(Expense.sum).mockResolvedValue(300 as any);
    vi.mocked(Customer.sum).mockResolvedValue(50 as any);
    vi.mocked(Supplier.sum).mockResolvedValue(75 as any);
  };

  it('attributes expenses to the user-entered date, not createdAt', async () => {
    stubSums();

    await handlers['analytics:getSummary'](mockEvent, range);

    expect(Expense.sum).toHaveBeenCalledWith(
      'amount',
      expect.objectContaining({
        where: {
          date: {
            [Op.between]: ['2026-03-01 00:00:00', '2026-03-31 23:59:59'],
          },
        },
      })
    );
    expect(vi.mocked(Expense.sum).mock.calls[0][1]).not.toHaveProperty(
      'where.createdAt'
    );
  });

  it('filters invoices, purchases, receipts, and payments by createdAt', async () => {
    stubSums();

    await handlers['analytics:getSummary'](mockEvent, range);

    const createdAtWhere = {
      where: {
        createdAt: {
          [Op.between]: ['2026-03-01 00:00:00', '2026-03-31 23:59:59'],
        },
      },
    };

    expect(Invoice.sum).toHaveBeenCalledWith(
      'amount',
      expect.objectContaining(createdAtWhere)
    );
    expect(Invoice.sum).toHaveBeenCalledWith(
      'profit',
      expect.objectContaining(createdAtWhere)
    );
    expect(Purchase.sum).toHaveBeenCalledWith(
      'amount',
      expect.objectContaining(createdAtWhere)
    );
    expect(Receipt.sum).toHaveBeenCalledWith(
      'amount',
      expect.objectContaining(createdAtWhere)
    );
    expect(Payment.sum).toHaveBeenCalledWith(
      'amount',
      expect.objectContaining(createdAtWhere)
    );
  });

  it('sums money as floats so kobo is not integer-truncated', async () => {
    stubSums();

    await handlers['analytics:getSummary'](mockEvent, range);

    const assertFloatSum = (mock: { mock: { calls: unknown[][] } }) => {
      for (const call of mock.mock.calls) {
        expect((call[1] as { dataType: { key: string } }).dataType.key).toBe(
          'FLOAT'
        );
      }
    };

    assertFloatSum(Invoice.sum);
    assertFloatSum(Purchase.sum);
    assertFloatSum(Receipt.sum);
    assertFloatSum(Payment.sum);
    assertFloatSum(Expense.sum);
    assertFloatSum(Customer.sum);
    assertFloatSum(Supplier.sum);
  });

  it('preserves fractional totals from SUM', async () => {
    vi.mocked(Invoice.sum)
      .mockResolvedValueOnce(1234.56 as any)
      .mockResolvedValueOnce(98.76 as any);
    vi.mocked(Purchase.sum).mockResolvedValue(400.1 as any);
    vi.mocked(Receipt.sum).mockResolvedValue(200.25 as any);
    vi.mocked(Payment.sum).mockResolvedValue(150.5 as any);
    vi.mocked(Expense.sum).mockResolvedValue(45.67 as any);
    vi.mocked(Customer.sum).mockResolvedValue(12.34 as any);
    vi.mocked(Supplier.sum).mockResolvedValue(56.78 as any);

    const result = await handlers['analytics:getSummary'](mockEvent, range);

    expect(result).toEqual({
      invoiceTotal: 1234.56,
      invoiceProfit: 98.76,
      purchaseTotal: 400.1,
      receiptTotal: 200.25,
      paymentTotal: 150.5,
      expenseTotal: 45.67,
      customerBalanceSum: 12.34,
      supplierBalanceSum: 56.78,
    });
  });

  it('coerces null aggregate sums to 0', async () => {
    vi.mocked(Invoice.sum).mockResolvedValue(null as any);
    vi.mocked(Purchase.sum).mockResolvedValue(null as any);
    vi.mocked(Receipt.sum).mockResolvedValue(null as any);
    vi.mocked(Payment.sum).mockResolvedValue(null as any);
    vi.mocked(Expense.sum).mockResolvedValue(null as any);
    vi.mocked(Customer.sum).mockResolvedValue(null as any);
    vi.mocked(Supplier.sum).mockResolvedValue(null as any);

    const result = await handlers['analytics:getSummary'](mockEvent, range);

    expect(result).toEqual({
      invoiceTotal: 0,
      invoiceProfit: 0,
      purchaseTotal: 0,
      receiptTotal: 0,
      paymentTotal: 0,
      expenseTotal: 0,
      customerBalanceSum: 0,
      supplierBalanceSum: 0,
    });
  });
});

describe('analytics:getExpenseBreakdown', () => {
  it('groups expenses by the user-entered date, not createdAt', async () => {
    vi.mocked(database.query).mockResolvedValue([
      { type: 'fuel', total: '100' },
      { type: 'rent', total: '300' },
    ] as any);

    const result = await handlers['analytics:getExpenseBreakdown'](
      mockEvent,
      range
    );

    const [sql, options] = vi.mocked(database.query).mock.calls[0];
    expect(sql).toMatch(/WHERE expenses\.date BETWEEN :startStr AND :endStr/);
    expect(sql).not.toMatch(/createdAt/);
    expect(options).toMatchObject({
      replacements: {
        startStr: '2026-03-01 00:00:00',
        endStr: '2026-03-31 23:59:59',
      },
    });
    expect(result).toEqual([
      { type: 'fuel', total: 100, pct: 25 },
      { type: 'rent', total: 300, pct: 75 },
    ]);
  });
});

describe('analytics:getTopCustomers', () => {
  it('coerces SUM totals to numbers', async () => {
    vi.mocked(database.query).mockResolvedValue([
      { customerId: 1, fullName: 'Ada', total: '2500' },
    ] as any);

    const result = await handlers['analytics:getTopCustomers'](
      mockEvent,
      range
    );

    expect(result).toEqual([
      { customerId: 1, fullName: 'Ada', total: 2500 },
    ]);
  });
});
