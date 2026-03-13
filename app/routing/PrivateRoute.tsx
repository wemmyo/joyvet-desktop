import React from 'react';
import { Navigate } from 'react-router-dom';
import routes from './routes';

type Props = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children }: Props) => {
  if (!localStorage.getItem('user')) {
    return <Navigate to={routes.LOGIN} replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;
