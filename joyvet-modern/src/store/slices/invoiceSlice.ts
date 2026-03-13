import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Invoice, PaginationParams, PaginatedResponse } from '@/types';

const mockInvoices: Invoice[] = [];

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockInvoices,
      total: mockInvoices.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(mockInvoices.length / params.limit),
    } as PaginatedResponse<Invoice>;
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockInvoices.push(newInvoice);
    return newInvoice;
  }
);

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Invoice> | null;
}

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
  pagination: null,
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch invoices';
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.push(action.payload);
      });
  },
});

export const { clearError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
