/* eslint react/jsx-props-no-spreading: off */
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import AppShell from '../layouts/AppShell';
import App from '../views/App';
import PrivateRoute from './PrivateRoute';
import {
  AllPurchasesScreen,
  AnalyticsScreen,
  CustomerHistory,
  CustomersScreen,
  EditInvoiceScreen,
  ExpenseScreen,
  InvoiceScreen,
  LoginScreen,
  PaymentScreen,
  ProductHistory,
  ProductScreen,
  PurchaseScreen,
  ReceiptScreen,
  SalesScreen,
  StoreInfoScreen,
  SupplierHistory,
  SupplierScreen,
  UserScreen,
} from './routeScreens';
import routes from './routes';

const routeFallback = (
  <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
    Loading...
  </div>
);

export default function RoutesComponent() {
  return (
    <App>
      <Toaster richColors />
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path={routes.LOGIN} element={<LoginScreen />} />
          <Route
            element={
              <PrivateRoute>
                <AppShell />
              </PrivateRoute>
            }
          >
            <Route
              path={`${routes.PRODUCT}/:id`}
              element={<ProductHistory />}
            />
            <Route
              path={`${routes.SUPPLIER}/:id`}
              element={<SupplierHistory />}
            />
            <Route
              path={`${routes.CUSTOMER}/:id`}
              element={<CustomerHistory />}
            />
            <Route
              path={`${routes.INVOICE}/:id`}
              element={<EditInvoiceScreen />}
            />
            <Route path={routes.STORE_INFO} element={<StoreInfoScreen />} />
            <Route path={routes.EXPENSE} element={<ExpenseScreen />} />
            <Route path={routes.USER} element={<UserScreen />} />
            <Route path={routes.SALES} element={<SalesScreen />} />
            <Route
              path={routes.ALL_PURCHASES}
              element={<AllPurchasesScreen />}
            />
            <Route path={routes.PURCHASE} element={<PurchaseScreen />} />
            <Route path={routes.PAYMENT} element={<PaymentScreen />} />
            <Route path={routes.RECEIPT} element={<ReceiptScreen />} />
            <Route path={routes.SUPPLIER} element={<SupplierScreen />} />
            <Route path={routes.PRODUCT} element={<ProductScreen />} />
            <Route path={routes.INVOICE} element={<InvoiceScreen />} />
            <Route path={routes.CUSTOMER} element={<CustomersScreen />} />
            <Route path={routes.ANALYTICS} element={<AnalyticsScreen />} />
          </Route>
        </Routes>
      </Suspense>
    </App>
  );
}
