const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
    on: vi.fn(),
  },
}));

vi.mock('../../runtime', () => ({
  withAppReady: (fn: Function) => fn,
}));

vi.mock('../../../models/expenseType', () => ({
  default: { findAll: vi.fn(), create: vi.fn() },
}));

vi.mock('../../../services/expense.service', () => ({
  getExpenseById: vi.fn(),
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  deleteExpense: vi.fn(),
  updateExpense: vi.fn(),
}));

vi.mock('../../../models/expense', () => ({
  default: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));

import ExpenseModel from '../../../models/expense';
import * as expenseService from '../../../services/expense.service';
import { registerExpenseHandlers } from '../expense.handlers';

const mockEvent = {} as any;

beforeEach(() => {
  vi.clearAllMocks();
  registerExpenseHandlers();
});

describe('expense:getAll', () => {
  it('returns paginated results', async () => {
    vi.mocked(ExpenseModel.findAndCountAll).mockResolvedValue({
      rows: [{ id: 1, type: 'Fuel', amount: 500, toJSON: () => ({ id: 1 }) }],
      count: 1,
    } as any);

    const result = await handlers['expense:getAll'](mockEvent, {
      page: 1,
      pageSize: 25,
    });

    expect(result).toMatchObject({
      rows: expect.any(Array),
      total: 1,
      page: 1,
      pageSize: 25,
    });
    expect(ExpenseModel.findAndCountAll).toHaveBeenCalled();
  });
});

describe('expense:filter', () => {
  it('throws when date range exceeds 365 days', async () => {
    await expect(
      handlers['expense:filter'](mockEvent, '2024-01-01', '2025-06-01')
    ).rejects.toThrow('Date range too large');
  });

  it('returns results for a valid date range', async () => {
    vi.mocked(expenseService.getExpenses).mockResolvedValue([
      { id: 1, toJSON: () => ({ id: 1 }) },
    ] as any);

    const result = await handlers['expense:filter'](
      mockEvent,
      '2025-01-01',
      '2025-01-31'
    );
    expect(result).toHaveLength(1);
  });
});

describe('expense:search', () => {
  it('returns paginated search results', async () => {
    vi.mocked(ExpenseModel.findAndCountAll).mockResolvedValue({
      rows: [{ id: 1, toJSON: () => ({ id: 1 }) }],
      count: 1,
    } as any);

    const result = await handlers['expense:search'](mockEvent, {
      search: 'fuel',
      page: 1,
      pageSize: 25,
    });
    expect(result).toMatchObject({ rows: expect.any(Array), total: 1 });
  });
});
