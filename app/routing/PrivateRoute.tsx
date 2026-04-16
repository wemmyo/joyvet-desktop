import type React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserSession } from '../utils/session';
import routes from './routes';

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
