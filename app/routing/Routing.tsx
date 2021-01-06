/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import routes from './routes';
import App from '../views/App';
// import HomePage from './views/HomePage';
import LoginScreen from '../views/Login/Login';
import OverviewScreen from '../views/Overview/Overview';
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

// Lazily load routes and code split with webpacck
// const LazyCounterPage = React.lazy(() =>
//   import(/* webpackChunkName: "CounterPage" */ './views/CounterPage')
// );

// const CounterPage = (props: Record<string, any>) => (
//   <React.Suspense fallback={<h1>Loading...</h1>}>
//     <LazyCounterPage {...props} />
//   </React.Suspense>
// );

export default function Routes() {
  return (
    <App>
      <ToastContainer autoClose={2000} />
      <Switch>
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
        <PrivateRoute path={routes.OVERVIEW} component={OverviewScreen} />
        <Route exact path={routes.LOGIN} component={LoginScreen} />
      </Switch>
    </App>
  );
}
