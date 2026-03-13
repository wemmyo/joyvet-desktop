import { configureStore, Action } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { ThunkAction } from 'redux-thunk';
import dashboardReducer from './slices/dashboardSlice';

export type RootState = {
  dashboard: ReturnType<typeof dashboardReducer>;
};

const excludeLoggerEnvs = ['test', 'production'];
const shouldIncludeLogger = !excludeLoggerEnvs.includes(
  process.env.NODE_ENV || ''
);

export const configuredStore = (initialState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: {
      dashboard: dashboardReducer,
    },
    middleware: (getDefaultMiddleware) => {
      const middlewares = getDefaultMiddleware();
      if (shouldIncludeLogger) {
        const logger = createLogger({ level: 'info', collapsed: true });
        return middlewares.concat(logger);
      }
      return middlewares;
    },
    preloadedState: initialState,
  });

  return store;
};

export type Store = ReturnType<typeof configuredStore>;
export type AppDispatch = Store['dispatch'];
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
