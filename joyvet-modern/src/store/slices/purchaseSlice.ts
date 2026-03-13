import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Purchase, PaginationParams, PaginatedResponse } from '@/types';

const mockPurchases: Purchase[] = [];

export const fetchPurchases = createAsyncThunk(
  'purchases/fetchPurchases',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockPurchases,
      total: mockPurchases.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(mockPurchases.length / params.limit),
    } as PaginatedResponse<Purchase>;
  }
);

export const createPurchase = createAsyncThunk(
  'purchases/createPurchase',
  async (purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPurchase: Purchase = {
      ...purchaseData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPurchases.push(newPurchase);
    return newPurchase;
  }
);

interface PurchaseState {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Purchase> | null;
}

const initialState: PurchaseState = {
  purchases: [],
  loading: false,
  error: null,
  pagination: null,
};

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch purchases';
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.purchases.push(action.payload);
      });
  },
});

export const { clearError } = purchaseSlice.actions;
export default purchaseSlice.reducer;
