import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, PaginationParams, PaginatedResponse } from '@/types';

const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Administrator',
    email: 'admin@joyvet.com',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: PaginationParams) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: mockUsers,
      total: mockUsers.length,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(mockUsers.length / params.limit),
    } as PaginatedResponse<User>;
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newUser: User = {
      ...userData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);
    return newUser;
  }
);

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<User> | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  pagination: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
