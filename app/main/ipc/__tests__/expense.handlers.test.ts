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

vi.mock('../../../services/expense.service', () => ({
  getExpenses: vi.fn(),
  createExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));

vi.mock('../../../models/expenseType', () => ({
  default: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
}));

import * as expenseService from '../../../services/expense.service';
import ExpenseTypeModel from '../../../models/expenseType';
import { registerExpenseHandlers } from '../expense.handlers';

const mockEvent = {} as any;

const mockExpense = {
  id: 1,
  type: 'Fuel',
  amount: 2000,
  date: '2024-01-15',
  note: 'Monthly fuel',
  toJSON: () => ({
    id: 1,
    type: 'Fuel',
    amount: 2000,
    date: '2024-01-15',
    note: 'Monthly fuel',
  }),
};

const mockExpenseType = {
  id: 1,
  type: 'Fuel',
  toJSON: () => ({ id: 1, type: 'Fuel' }),
};

describe('expense IPC handlers', () => {
  beforeAll(() => {
    registerExpenseHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ getAll
  describe('expense:getAll', () => {
    it('returns all expenses serialized', async () => {
      (expenseService.getExpenses as any).mockResolvedValue([mockExpense]);
      const result = await handlers['expense:getAll'](mockEvent);
      expect(result).toEqual([mockExpense.toJSON()]);
    });

    it('throws on service error', async () => {
      (expenseService.getExpenses as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['expense:getAll'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // ------------------------------------------------------------------ create
  describe('expense:create', () => {
    it('creates an expense and returns serialized result', async () => {
      (expenseService.createExpense as any).mockResolvedValue(mockExpense);
      const result = await handlers['expense:create'](mockEvent, {
        type: 'Fuel',
        amount: 2000,
        date: '2024-01-15',
        note: 'Monthly fuel',
      });
      expect(expenseService.createExpense).toHaveBeenCalled();
      expect(result).toEqual(mockExpense.toJSON());
    });

    it('throws on validation error when type is empty', async () => {
      await expect(
        handlers['expense:create'](mockEvent, {
          type: '',
          amount: 2000,
          date: '2024-01-15',
          note: '',
        })
      ).rejects.toThrow();
    });

    it('throws on validation error when date is empty', async () => {
      await expect(
        handlers['expense:create'](mockEvent, {
          type: 'Fuel',
          amount: 2000,
          date: '',
          note: '',
        })
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ delete
  describe('expense:delete', () => {
    it('deletes an expense', async () => {
      (expenseService.deleteExpense as any).mockResolvedValue(undefined);
      await handlers['expense:delete'](mockEvent, 1);
      expect(expenseService.deleteExpense).toHaveBeenCalledWith(1);
    });

    it('throws on validation error when id is invalid', async () => {
      await expect(
        handlers['expense:delete'](mockEvent, 'invalid' as any)
      ).rejects.toThrow();
    });
  });

  // ------------------------------------------------------------------ filter
  describe('expense:filter', () => {
    it('filters expenses by date range', async () => {
      (expenseService.getExpenses as any).mockResolvedValue([mockExpense]);
      const result = await handlers['expense:filter'](
        mockEvent,
        '2024-01-01',
        '2024-01-31'
      );
      expect(result).toEqual([mockExpense.toJSON()]);
      const callArg = (expenseService.getExpenses as any).mock.calls[0][0];
      expect(callArg.where?.date).toBeDefined();
    });

    it('throws on validation error when startDate is empty', async () => {
      await expect(
        handlers['expense:filter'](mockEvent, '', '2024-01-31')
      ).rejects.toThrow();
    });

    it('throws on validation error when endDate is empty', async () => {
      await expect(
        handlers['expense:filter'](mockEvent, '2024-01-01', '')
      ).rejects.toThrow();
    });
  });

  // --------------------------------------------------------------- getTypes
  describe('expense:getTypes', () => {
    it('returns all expense types serialized', async () => {
      (ExpenseTypeModel.findAll as any).mockResolvedValue([mockExpenseType]);
      const result = await handlers['expense:getTypes'](mockEvent);
      expect(result).toEqual([mockExpenseType.toJSON()]);
    });

    it('throws on model error', async () => {
      (ExpenseTypeModel.findAll as any).mockRejectedValue(
        new Error('DB error')
      );
      await expect(handlers['expense:getTypes'](mockEvent)).rejects.toThrow(
        'DB error'
      );
    });
  });

  // ------------------------------------------------------------- createType
  describe('expense:createType', () => {
    it('creates an expense type', async () => {
      (ExpenseTypeModel.create as any).mockResolvedValue(mockExpenseType);
      const result = await handlers['expense:createType'](mockEvent, {
        type: 'Fuel',
      });
      expect(ExpenseTypeModel.create).toHaveBeenCalledWith({ type: 'Fuel' });
      expect(result).toEqual(mockExpenseType.toJSON());
    });

    it('throws on validation error when type is empty', async () => {
      await expect(
        handlers['expense:createType'](mockEvent, { type: '' })
      ).rejects.toThrow();
    });
  });
});
