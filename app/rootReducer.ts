import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlice';
import supplierReducer from './slices/supplierSlice';
import paymentReducer from './slices/paymentSlice';
import purchaseReducer from './slices/purchaseSlice';
import receiptReducer from './slices/receiptSlice';
import invoiceReducer from './slices/invoiceSlice';
import dashboardReducer from './slices/dashboardSlice';
// eslint-disable-next-line import/no-cycle
// import counterReducer from './features/counter/counterSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    customer: customerReducer,
    product: productReducer,
    supplier: supplierReducer,
    payment: paymentReducer,
    receipt: receiptReducer,
    purchase: purchaseReducer,
    invoice: invoiceReducer,
    dashboard: dashboardReducer,
  });
}
