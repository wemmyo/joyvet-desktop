/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import routes from './routes';
import App from '../views/App';
import LoginScreen from '../views/Login/Login';
import CustomersScreen from '../views/Customer/Customer';
import InvoiceScreen from '../views/Invoice/Invoice';
import ProductScreen from '../views/Product/Product';
import SupplierScreen from '../views/Supplier/Supplier';
import ReceiptScreen from '../views/Receipt/Receipt';
import PaymentScreen from '../views/Payment/Payment';
import PurchaseScreen from '../views/Purchase/Purchase';
import AllPurchasesScreen from '../views/AllPurchases/AllPurchases';
import SalesScreen from '../views/Sales/Sales';
import UserScreen from '../views/User/User';
import ExpenseScreen from '../views/Expense/Expense';
import PrivateRoute from './PrivateRoute';
import EditInvoiceScreen from '../views/Invoice/components/EditInvoice';
import CustomerHistory from '../views/CustomerHistory/CustomerHistory';
import SupplierHistory from '../views/SupplierHistory/SupplierHistory';
import ProductHistory from '../views/ProductHistory/ProductHistory';
import StoreInfoScreen from '../views/StoreInfo/StoreInfo';

export default function RoutesComponent() {
  return (
    <App>
      <ToastContainer autoClose={5000} />
      <Routes>
        <Route path={routes.LOGIN} element={<LoginScreen />} />
        <Route path={`${routes.PRODUCT}/:id`} element={<PrivateRoute><ProductHistory /></PrivateRoute>} />
        <Route path={`${routes.SUPPLIER}/:id`} element={<PrivateRoute><SupplierHistory /></PrivateRoute>} />
        <Route path={`${routes.CUSTOMER}/:id`} element={<PrivateRoute><CustomerHistory /></PrivateRoute>} />
        <Route path={`${routes.INVOICE}/:id`} element={<PrivateRoute><EditInvoiceScreen /></PrivateRoute>} />
        <Route path={routes.STORE_INFO} element={<PrivateRoute><StoreInfoScreen /></PrivateRoute>} />
        <Route path={routes.EXPENSE} element={<PrivateRoute><ExpenseScreen /></PrivateRoute>} />
        <Route path={routes.USER} element={<PrivateRoute><UserScreen /></PrivateRoute>} />
        <Route path={routes.SALES} element={<PrivateRoute><SalesScreen /></PrivateRoute>} />
        <Route path={routes.ALL_PURCHASES} element={<PrivateRoute><AllPurchasesScreen /></PrivateRoute>} />
        <Route path={routes.PURCHASE} element={<PrivateRoute><PurchaseScreen /></PrivateRoute>} />
        <Route path={routes.PAYMENT} element={<PrivateRoute><PaymentScreen /></PrivateRoute>} />
        <Route path={routes.RECEIPT} element={<PrivateRoute><ReceiptScreen /></PrivateRoute>} />
        <Route path={routes.SUPPLIER} element={<PrivateRoute><SupplierScreen /></PrivateRoute>} />
        <Route path={routes.PRODUCT} element={<PrivateRoute><ProductScreen /></PrivateRoute>} />
        <Route path={routes.INVOICE} element={<PrivateRoute><InvoiceScreen /></PrivateRoute>} />
        <Route path={routes.CUSTOMER} element={<PrivateRoute><CustomersScreen /></PrivateRoute>} />
      </Routes>
    </App>
  );
}
