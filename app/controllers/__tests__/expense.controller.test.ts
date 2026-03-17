vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  expense: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    filter: vi.fn(),
  },
};
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true,
});

import { toast } from 'sonner';
import {
  searchExpenseFn,
  deleteExpenseFn,
  updateExpenseFn,
  getSingleExpenseFn,
  filterExpensesFn,
  createExpenseFn,
} from '../expense.controller';

const mockExpense = {
  id: 1,
  type: 'Fuel',
  amount: 2000,
  date: '2024-01-15',
  note: 'Monthly fuel',
};

describe('expense controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createExpenseFn', () => {
    it('creates an expense and returns result', async () => {
      mockApi.expense.create.mockResolvedValue(mockExpense);
      const cb = vi.fn();
      const result = await createExpenseFn(
        { type: 'Fuel', amount: 2000, date: '2024-01-15', note: '' },
        cb
      );
      expect(result).toEqual(mockExpense);
      expect(mockApi.expense.create).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.create.mockRejectedValue(new Error('Create failed'));
      await createExpenseFn({ type: 'Fuel', amount: 2000, date: '2024-01-15', note: '' });
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('getSingleExpenseFn', () => {
    it('returns a single expense by id', async () => {
      mockApi.expense.getById.mockResolvedValue(mockExpense);
      const cb = vi.fn();
      const result = await getSingleExpenseFn(1, cb);
      expect(result).toEqual(mockExpense);
      expect(mockApi.expense.getById).toHaveBeenCalledWith(1);
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.getById.mockRejectedValue(new Error('Not found'));
      await getSingleExpenseFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateExpenseFn', () => {
    it('updates an expense and calls toast.success', async () => {
      mockApi.expense.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updateExpenseFn({ amount: 2500, note: 'Updated' }, 1, cb);
      expect(mockApi.expense.update).toHaveBeenCalledWith(1, {
        amount: 2500,
        note: 'Updated',
      });
      expect(toast.success).toHaveBeenCalledWith('Successfully updated');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.update.mockRejectedValue(new Error('Update failed'));
      await updateExpenseFn({ amount: 2500 }, 1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('deleteExpenseFn', () => {
    it('deletes an expense and calls toast.success', async () => {
      mockApi.expense.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteExpenseFn(1, cb);
      expect(mockApi.expense.delete).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.delete.mockRejectedValue(new Error('Delete failed'));
      await deleteExpenseFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('searchExpenseFn', () => {
    it('returns matching expenses', async () => {
      mockApi.expense.search.mockResolvedValue([mockExpense]);
      const result = await searchExpenseFn('Fuel');
      expect(result).toEqual([mockExpense]);
      expect(mockApi.expense.search).toHaveBeenCalledWith('Fuel');
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.search.mockRejectedValue(new Error('Search failed'));
      await searchExpenseFn('Fuel');
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('filterExpensesFn', () => {
    it('returns filtered expenses by date range', async () => {
      mockApi.expense.filter.mockResolvedValue([mockExpense]);
      const result = await filterExpensesFn({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(result).toEqual([mockExpense]);
      expect(mockApi.expense.filter).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31'
      );
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.filter.mockRejectedValue(new Error('Filter failed'));
      await filterExpensesFn({ startDate: '2024-01-01', endDate: '2024-01-31' });
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
