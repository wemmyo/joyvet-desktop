import * as React from 'react';
import { useHistory } from 'react-router-dom';

import LoginForm from './components/LoginForm/LoginForm';
import routes from '../../routing/routes';

// export interface LoginScreenProps {}

const LoginScreen = () => {
  const history = useHistory();

  if (localStorage.getItem('user') !== null) {
    history.push(routes.INVOICE);
  }
  return (
    <div style={{ backgroundColor: '#89b4fa' }}>
      <LoginForm />
    </div>
  );
};

export default LoginScreen;
