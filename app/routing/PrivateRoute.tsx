import React from 'react';
import { Navigate } from 'react-router-dom';
import routes from './routes';
import { getUserSession } from '../utils/session';

type Props = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children }: Props) => {
  if (!getUserSession()) {
    return <Navigate to={routes.LOGIN} replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;
