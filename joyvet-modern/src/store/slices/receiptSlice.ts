import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Receipt, PaginationParams, PaginatedResponse } from '@/types';

const mockReceipts: Receipt[] = [];

export const fetchReceipts = createAsyncThunk(
  'receipts/fetchReceipts',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockReceipts,
      total: mockReceipts.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(mockReceipts.length / params.limit),
    } as PaginatedResponse<Receipt>;
  }
);

export const createReceipt = createAsyncThunk(
  'receipts/createReceipt',
  async (receiptData: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newReceipt: Receipt = {
      ...receiptData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockReceipts.push(newReceipt);
    return newReceipt;
  }
);

interface ReceiptState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Receipt> | null;
}

const initialState: ReceiptState = {
  receipts: [],
  loading: false,
  error: null,
  pagination: null,
};

const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceipts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.receipts = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch receipts';
      })
      .addCase(createReceipt.fulfilled, (state, action) => {
        state.receipts.push(action.payload);
      });
  },
});

export const { clearError } = receiptSlice.actions;
export default receiptSlice.reducer;
