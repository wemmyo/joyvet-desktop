/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import routes from './routes';
import App from '../views/App';
// import HomePage from './views/HomePage';
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

export default function Routes() {
  return (
    <App>
      <ToastContainer autoClose={5000} />
      <Switch>
        <PrivateRoute
          path={`${routes.PRODUCT}/:id`}
          component={ProductHistory}
        />
        <PrivateRoute
          path={`${routes.SUPPLIER}/:id`}
          component={SupplierHistory}
        />
        <PrivateRoute
          path={`${routes.CUSTOMER}/:id`}
          component={CustomerHistory}
        />
        <PrivateRoute
          path={`${routes.INVOICE}/:id`}
          component={EditInvoiceScreen}
        />
        <PrivateRoute path={routes.EXPENSE} component={ExpenseScreen} />
        <PrivateRoute path={routes.USER} component={UserScreen} />
        <PrivateRoute path={routes.SALES} component={SalesScreen} />
        <PrivateRoute
          path={routes.ALL_PURCHASES}
          component={AllPurchasesScreen}
        />
        <PrivateRoute path={routes.PURCHASE} component={PurchaseScreen} />
        <PrivateRoute path={routes.PAYMENT} component={PaymentScreen} />
        <PrivateRoute path={routes.RECEIPT} component={ReceiptScreen} />
        <PrivateRoute path={routes.SUPPLIER} component={SupplierScreen} />
        <PrivateRoute path={routes.PRODUCT} component={ProductScreen} />
        <PrivateRoute path={routes.INVOICE} component={InvoiceScreen} />
        <PrivateRoute path={routes.CUSTOMER} component={CustomersScreen} />
        <Route exact path={routes.LOGIN} component={LoginScreen} />
      </Switch>
    </App>
  );
}
