import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import bycrpt from 'bcryptjs';
import User from '../models/user';

const initialState = {
  singleUser: {
    loading: false,
    data: '',
  },
  users: {
    loading: false,
    data: '',
  },
  createUserState: {
    loading: false,
    data: '',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getSingleUser: (state) => {
      const { singleUser } = state;
      singleUser.loading = true;
    },
    getSingleUserSuccess: (state, { payload }) => {
      const { singleUser } = state;
      singleUser.loading = false;
      singleUser.data = payload;
    },
    getSingleUserFailed: (state) => {
      const { singleUser } = state;
      singleUser.loading = false;
      singleUser.data = '';
    },
    getUsers: (state) => {
      const { users } = state;
      users.loading = true;
    },
    getUsersSuccess: (state, { payload }) => {
      const { users } = state;
      users.loading = false;
      users.data = payload;
    },
    getUsersFailed: (state) => {
      const { users } = state;
      users.loading = false;
    },
    createUser: (state) => {
      const { createUserState } = state;
      createUserState.loading = true;
      createUserState.data = '';
    },
    createUserSuccess: (state, { payload }) => {
      const { createUserState } = state;
      createUserState.loading = false;
      createUserState.data = payload;
    },
    createUserFailed: (state) => {
      const { createUserState } = state;
      createUserState.loading = false;
    },
  },
});

export const {
  getSingleUser,
  getSingleUserSuccess,
  getSingleUserFailed,
  getUsers,
  getUsersSuccess,
  getUsersFailed,
  createUser,
  createUserSuccess,
  createUserFailed,
} = userSlice.actions;

export const updateUserFn = (
  values: any,
  id: string | number,
  cb?: () => void
) => async (dispatch: (arg0: { payload: any; type: string }) => void) => {
  try {
    // dispatch(updateUser());
    await User.update(values, {
      where: {
        id,
      },
    });
    // dispatch(updateUserSuccess(JSON.stringify(updateUserResponse)));
    toast.success('Successfully updated');
    if (cb) {
      cb();
    }
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getSingleUserFn = (id: string | number, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getSingleUser());

    const getSingleUserResponse = await User.findByPk(id);

    dispatch(getSingleUserSuccess(JSON.stringify(getSingleUserResponse)));
    if (cb) {
      cb();
    }
    console.log(getSingleUserResponse);
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const getUsersFn = () => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(getUsers());
    const users = await User.findAll();
    dispatch(getUsersSuccess(JSON.stringify(users)));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const createUserFn = (values: any, cb?: () => void) => async (
  dispatch: (arg0: { payload: any; type: string }) => void
) => {
  try {
    dispatch(createUser());
    // const response = await User.create(values);
    const hashedPassword = await bycrpt.hash(values.password, 12);
    await User.create({
      fullName: values.fullName || null,
      username: values.username || null,
      password: hashedPassword || null,
      role: values.role || null,
    });

    if (cb) {
      cb();
    }
    dispatch(createUserSuccess({}));
  } catch (error) {
    toast.error(error.message || '');
  }
};

export const selectUserState = (state: any) => state.user;

export default userSlice.reducer;
