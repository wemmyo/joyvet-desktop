/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './views/App';
// import HomePage from './views/HomePage';
import LoginScreen from './views/Login/Login';
import OverviewScreen from './views/Overview/Overview';

// Lazily load routes and code split with webpacck
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './views/CounterPage')
);

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.OVERVIEW} component={OverviewScreen} />
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.LOGIN} component={LoginScreen} />
      </Switch>
    </App>
  );
}
