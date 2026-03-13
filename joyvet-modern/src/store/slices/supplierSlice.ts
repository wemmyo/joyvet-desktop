import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Supplier, PaginationParams, PaginatedResponse } from '@/types';

const mockSuppliers: Supplier[] = [];

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockSuppliers,
      total: mockSuppliers.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(mockSuppliers.length / params.limit),
    } as PaginatedResponse<Supplier>;
  }
);

export const createSupplier = createAsyncThunk(
  'suppliers/createSupplier',
  async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockSuppliers.push(newSupplier);
    return newSupplier;
  }
);

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Supplier> | null;
}

const initialState: SupplierState = {
  suppliers: [],
  loading: false,
  error: null,
  pagination: null,
};

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch suppliers';
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.push(action.payload);
      });
  },
});

export const { clearError } = supplierSlice.actions;
export default supplierSlice.reducer;
