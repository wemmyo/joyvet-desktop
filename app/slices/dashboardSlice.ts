import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sideContentisOpen: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    openSideContent: (state) => {
      state.sideContentisOpen = true;
    },
    closeSideContent: (state) => {
      state.sideContentisOpen = false;
    },
  },
});

export const { openSideContent, closeSideContent } = dashboardSlice.actions;

export const openSideContentFn = () => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  dispatch(openSideContent());
};

export const closeSideContentFn = () => async (
  dispatch: (arg0: { payload: unknown; type: string }) => void
) => {
  dispatch(closeSideContent());
};

export const selectDashboardState = (state: any) => state.dashboard;

export default dashboardSlice.reducer;
