vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockApi = {
  expense: {
    search: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    getById: vi.fn(),
    filter: vi.fn(),
    create: vi.fn(),
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
  type: 'Medicine',
  amount: 500,
  date: '2024-01-15',
};

describe('expense controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchExpenseFn', () => {
    it('calls window.api.expense.search', async () => {
      mockApi.expense.search.mockResolvedValue({
        rows: [mockExpense],
        total: 1,
        page: 1,
        pageSize: 25,
      });
      const result = await searchExpenseFn('Medicine');
      expect(mockApi.expense.search).toHaveBeenCalledWith({
        search: 'Medicine',
      });
      expect(result).toEqual([mockExpense]);
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.search.mockRejectedValue(new Error('Search failed'));
      const result = await searchExpenseFn('Medicine');
      expect(toast.error).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('deleteExpenseFn', () => {
    it('calls toast.success and cb on success', async () => {
      mockApi.expense.delete.mockResolvedValue(undefined);
      const cb = vi.fn();
      await deleteExpenseFn(1, cb);
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.delete.mockRejectedValue(new Error('Delete failed'));
      await deleteExpenseFn(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('updateExpenseFn', () => {
    it('calls toast.success and cb on success', async () => {
      mockApi.expense.update.mockResolvedValue(undefined);
      const cb = vi.fn();
      await updateExpenseFn({ type: 'Medicine', amount: 500 }, 1, cb);
      expect(toast.success).toHaveBeenCalledWith('Successfully updated');
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.update.mockRejectedValue(new Error('Update failed'));
      await updateExpenseFn({ type: 'Medicine' }, 1);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('getSingleExpenseFn', () => {
    it('returns expense', async () => {
      mockApi.expense.getById.mockResolvedValue(mockExpense);
      const result = await getSingleExpenseFn(1);
      expect(result).toEqual(mockExpense);
    });

    it('calls toast.error on failure and returns null', async () => {
      mockApi.expense.getById.mockRejectedValue(new Error('Not found'));
      const result = await getSingleExpenseFn(999);
      expect(toast.error).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('filterExpensesFn', () => {
    it('returns filtered result', async () => {
      mockApi.expense.filter.mockResolvedValue([mockExpense]);
      const result = await filterExpensesFn({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(result).toEqual([mockExpense]);
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.filter.mockRejectedValue(new Error('Filter failed'));
      const result = await filterExpensesFn({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(toast.error).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('createExpenseFn', () => {
    it('calls create and cb on success', async () => {
      mockApi.expense.create.mockResolvedValue(mockExpense);
      const cb = vi.fn();
      await createExpenseFn({ type: 'Medicine', amount: 500 }, cb);
      expect(mockApi.expense.create).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('calls toast.error on failure', async () => {
      mockApi.expense.create.mockRejectedValue(new Error('Create failed'));
      await createExpenseFn({ type: 'Medicine', amount: 500 });
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
