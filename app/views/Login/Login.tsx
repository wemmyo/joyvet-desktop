import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import LoginForm from './components/LoginForm/LoginForm';
import routes from '../../routing/routes';

// export interface LoginScreenProps {}

const LoginScreen = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem('user') !== null) {
      navigate(routes.INVOICE);
    }
  }, [navigate]);

  return (
    <div style={{ backgroundColor: '#89b4fa' }}>
      <LoginForm />
    </div>
  );
};

export default LoginScreen;
