import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

import dashboardReducer from './slices/dashboardSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),

    dashboard: dashboardReducer,
  });
}
