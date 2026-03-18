const handlers: Record<string, Function> = {};

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      handlers[channel] = handler;
    }),
  },
}));

vi.mock('../../../services/expense.service', () => ({
  getExpenses: vi.fn(),
  getExpenseById: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
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
  type: 'Medicine',
  amount: 500,
  date: new Date('2024-01-15'),
  note: 'Test note',
  toJSON: () => ({ id: 1, type: 'Medicine', amount: 500 }),
};

describe('expense IPC handlers', () => {
  beforeAll(() => {
    registerExpenseHandlers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('expense:getAll', () => {
    it('delegates to getExpenses service', async () => {
      (expenseService.getExpenses as any).mockResolvedValue([mockExpense]);
      const result = await handlers['expense:getAll'](mockEvent);
      expect(expenseService.getExpenses).toHaveBeenCalled();
      expect(result).toEqual([mockExpense.toJSON()]);
    });
  });

  describe('expense:getById', () => {
    it('delegates to getExpenseById service', async () => {
      (expenseService.getExpenseById as any).mockResolvedValue(mockExpense);
      const result = await handlers['expense:getById'](mockEvent, 1);
      expect(expenseService.getExpenseById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockExpense.toJSON());
    });
  });

  describe('expense:create', () => {
    it('validates and calls createExpense', async () => {
      (expenseService.createExpense as any).mockResolvedValue(mockExpense);
      const result = await handlers['expense:create'](mockEvent, {
        type: 'Medicine',
        amount: 500,
        date: '2024-01-15',
        note: 'Test note',
      });
      expect(expenseService.createExpense).toHaveBeenCalled();
      expect(result).toEqual(mockExpense.toJSON());
    });
  });

  describe('expense:update', () => {
    it('calls updateExpense', async () => {
      (expenseService.updateExpense as any).mockResolvedValue(undefined);
      await handlers['expense:update'](mockEvent, 1, {
        type: 'Medicine',
        amount: 500,
        date: new Date('2024-01-15'),
      });
      expect(expenseService.updateExpense).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ type: 'Medicine', amount: 500 })
      );
    });
  });

  describe('expense:delete', () => {
    it('calls deleteExpense', async () => {
      (expenseService.deleteExpense as any).mockResolvedValue(undefined);
      await handlers['expense:delete'](mockEvent, 1);
      expect(expenseService.deleteExpense).toHaveBeenCalledWith(1);
    });
  });

  describe('expense:filter', () => {
    it('passes date range to service', async () => {
      (expenseService.getExpenses as any).mockResolvedValue([mockExpense]);
      const result = await handlers['expense:filter'](mockEvent, '2024-01-01', '2024-01-31');
      expect(expenseService.getExpenses).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() })
      );
      expect(result).toEqual([mockExpense.toJSON()]);
    });
  });

  describe('expense:search', () => {
    it('calls service with search term', async () => {
      (expenseService.getExpenses as any).mockResolvedValue([mockExpense]);
      const result = await handlers['expense:search'](mockEvent, 'Medicine');
      expect(expenseService.getExpenses).toHaveBeenCalled();
      expect(result).toEqual([mockExpense.toJSON()]);
    });
  });

  describe('expense:getTypes', () => {
    it('calls ExpenseType.findAll', async () => {
      const mockType = { id: 1, type: 'Medicine', toJSON: () => ({ id: 1, type: 'Medicine' }) };
      (ExpenseTypeModel.findAll as any).mockResolvedValue([mockType]);
      const result = await handlers['expense:getTypes'](mockEvent);
      expect(ExpenseTypeModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockType.toJSON()]);
    });
  });

  describe('expense:createType', () => {
    it('calls ExpenseType.create with validated name', async () => {
      const mockType = { id: 1, type: 'Surgery', toJSON: () => ({ id: 1, type: 'Surgery' }) };
      (ExpenseTypeModel.create as any).mockResolvedValue(mockType);
      const result = await handlers['expense:createType'](mockEvent, { type: 'Surgery' });
      expect(ExpenseTypeModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'Surgery' })
      );
      expect(result).toEqual(mockType.toJSON());
    });
  });
});
