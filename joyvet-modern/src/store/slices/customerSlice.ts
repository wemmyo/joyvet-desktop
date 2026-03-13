import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Customer, PaginationParams, PaginatedResponse } from '@/types';

// Mock data matching original structure
const mockCustomers: Customer[] = [
  {
    id: 1,
    fullName: 'John Doe',
    address: '123 Main St, City',
    phoneNumber: '+1234567890',
    balance: 150.50,
    postedBy: 'admin',
    maxPriceLevel: 1,
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    address: '456 Oak Ave, Town',
    phoneNumber: '+0987654321',
    balance: 75.25,
    postedBy: 'admin',
    maxPriceLevel: 2,
  },
  {
    id: 3,
    fullName: 'Bob Johnson',
    address: '789 Pine Rd, Village',
    phoneNumber: '+1122334455',
    balance: 200.00,
    postedBy: 'admin',
    maxPriceLevel: 1,
  },
];

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: PaginationParams) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const { page, limit, search } = params;
    let filteredCustomers = mockCustomers;

    if (search) {
      filteredCustomers = mockCustomers.filter(customer =>
        customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        customer.phoneNumber?.includes(search)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    return {
      data: paginatedCustomers,
      total: filteredCustomers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCustomers.length / limit),
    } as PaginatedResponse<Customer>;
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: Omit<Customer, 'id'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newCustomer: Customer = {
      ...customerData,
      id: Math.max(...mockCustomers.map(c => c.id)) + 1,
    };

    mockCustomers.push(newCustomer);
    return newCustomer;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async (customerData: Partial<Customer> & { id: number }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockCustomers.findIndex(c => c.id === customerData.id);
    if (index !== -1) {
      mockCustomers[index] = { ...mockCustomers[index], ...customerData };
      return mockCustomers[index];
    }
    throw new Error('Customer not found');
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockCustomers.findIndex(c => c.id === customerId);
    if (index !== -1) {
      mockCustomers.splice(index, 1);
      return customerId;
    }
    throw new Error('Customer not found');
  }
);

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Customer> | null;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
  pagination: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearError, setCustomers } = customerSlice.actions;
export default customerSlice.reducer;
