import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Expense, PaginationParams, PaginatedResponse } from '@/types';

const mockExpenses: Expense[] = [];

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockExpenses,
      total: mockExpenses.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(mockExpenses.length / params.limit),
    } as PaginatedResponse<Expense>;
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newExpense: Expense = {
      ...expenseData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockExpenses.push(newExpense);
    return newExpense;
  }
);

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Expense> | null;
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
  pagination: null,
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
