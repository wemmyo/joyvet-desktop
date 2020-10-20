import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import customerReducer from './slices/customerSlice';
// eslint-disable-next-line import/no-cycle
// import counterReducer from './features/counter/counterSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    customer: customerReducer,
  });
}
