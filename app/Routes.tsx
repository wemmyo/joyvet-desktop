/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import routes from './constants/routes';
import App from './views/App';
// import HomePage from './views/HomePage';
import LoginScreen from './views/Login/Login';
import OverviewScreen from './views/Overview/Overview';
import CustomersScreen from './views/Customer/Customer';
import InvoiceScreen from './views/Invoice/Invoice';
import ProductScreen from './views/Product/Product';
import SupplierScreen from './views/Supplier/Supplier';
import ReceiptScreen from './views/Receipt/Receipt';
import PaymentScreen from './views/Payment/Payment';
import PurchaseScreen from './views/Purchase/Purchase';
import SalesScreen from './views/Sales/Sales';
import UserScreen from './views/User/User';

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
      <ToastContainer autoClose={10000} />
      <Switch>
        <Route path={routes.USER} component={UserScreen} />
        <Route path={routes.SALES} component={SalesScreen} />
        <Route path={routes.PURCHASE} component={PurchaseScreen} />
        <Route path={routes.PAYMENT} component={PaymentScreen} />
        <Route path={routes.RECEIPT} component={ReceiptScreen} />
        <Route path={routes.SUPPLIER} component={SupplierScreen} />
        <Route path={routes.PRODUCT} component={ProductScreen} />
        <Route path={routes.INVOICE} component={InvoiceScreen} />
        <Route path={routes.CUSTOMER} component={CustomersScreen} />
        <Route path={routes.OVERVIEW} component={OverviewScreen} />
        <Route exact path={routes.LOGIN} component={LoginScreen} />
      </Switch>
    </App>
  );
}
