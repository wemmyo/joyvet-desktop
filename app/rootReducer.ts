import { combineReducers } from 'redux';
import dashboardReducer from './slices/dashboardSlice';

export default function createRootReducer() {
  return combineReducers({
    dashboard: dashboardReducer,
  });
}
