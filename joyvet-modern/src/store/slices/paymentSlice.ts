import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Payment, PaginationParams, PaginatedResponse } from '@/types';

const mockPayments: Payment[] = [];

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockPayments,
      total: mockPayments.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(mockPayments.length / params.limit),
    } as PaginatedResponse<Payment>;
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPayment: Payment = {
      ...paymentData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPayments.push(newPayment);
    return newPayment;
  }
);

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Payment> | null;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
  pagination: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload);
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
