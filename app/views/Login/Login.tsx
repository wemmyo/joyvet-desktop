import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import routes from '../../routing/routes';
import { getBootstrapStatusFn } from '../../controllers/auth.controller';
import { getUserSession } from '../../utils/session';
import LoginForm from './components/LoginForm/LoginForm';
import InitialAdminSetupForm from './components/InitialAdminSetupForm';

// export interface LoginScreenProps {}

const LoginScreen = () => {
  const navigate = useNavigate();
  const [hasUsers, setHasUsers] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let active = true;

    const hydrateBootstrapState = async () => {
      if (getUserSession()) {
        navigate(routes.INVOICE);
        return;
      }

      const status = await getBootstrapStatusFn();

      if (active) {
        setHasUsers(status.hasUsers);
      }
    };

    hydrateBootstrapState();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (hasUsers === null) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-6 md:p-10">
        <div className="text-sm text-muted-foreground">
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-sm">
        {hasUsers ? <LoginForm /> : <InitialAdminSetupForm />}
      </div>
    </div>
  );
};

export default LoginScreen;
