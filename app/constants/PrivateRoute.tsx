import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';

const PrivateRoute = ({ component, isAuthenticated, ...rest }: any) => {
  const routeComponent = (props: any) =>
    localStorage.getItem('access_token') ? (
      React.createElement(component, props)
    ) : (
      <Redirect to={{ pathname: '/' }} />
    );
  return <Route {...rest} render={routeComponent} />;
};

export default PrivateRoute;
