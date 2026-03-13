import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StoreInfo } from '@/types';

const mockStoreInfo: StoreInfo = {
  id: 1,
  name: 'JoyVet Veterinary Clinic',
  address: '123 Veterinary Street, Lagos, Nigeria',
  phoneNumber: '+2348012345678',
  email: 'info@joyvet.com',
  website: 'www.joyvet.com',
  logo: '',
  taxNumber: 'NG123456789',
  currency: 'NGN',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const fetchStoreInfo = createAsyncThunk(
  'storeInfo/fetchStoreInfo',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStoreInfo;
  }
);

export const updateStoreInfo = createAsyncThunk(
  'storeInfo/updateStoreInfo',
  async (storeData: Partial<StoreInfo> & { id: number }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    Object.assign(mockStoreInfo, {
      ...storeData,
      updatedAt: new Date(),
    });

    return mockStoreInfo;
  }
);

interface StoreInfoState {
  storeInfo: StoreInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoreInfoState = {
  storeInfo: null,
  loading: false,
  error: null,
};

const storeInfoSlice = createSlice({
  name: 'storeInfo',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.storeInfo = action.payload;
        state.error = null;
      })
      .addCase(fetchStoreInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch store info';
      })
      .addCase(updateStoreInfo.fulfilled, (state, action) => {
        state.storeInfo = action.payload;
      });
  },
});

export const { clearError } = storeInfoSlice.actions;
export default storeInfoSlice.reducer;
