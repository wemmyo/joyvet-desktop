import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlice';
import invoiceReducer from './slices/invoiceSlice';
import paymentReducer from './slices/paymentSlice';
import purchaseReducer from './slices/purchaseSlice';
import supplierReducer from './slices/supplierSlice';
import expenseReducer from './slices/expenseSlice';
import receiptReducer from './slices/receiptSlice';
import userReducer from './slices/userSlice';
import storeInfoReducer from './slices/storeInfoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    products: productReducer,
    invoices: invoiceReducer,
    payments: paymentReducer,
    purchases: purchaseReducer,
    suppliers: supplierReducer,
    expenses: expenseReducer,
    receipts: receiptReducer,
    users: userReducer,
    storeInfo: storeInfoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
