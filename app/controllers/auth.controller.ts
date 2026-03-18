import { toast } from 'sonner';
import { sanitizeUserSession, type UserSession } from '../types/session';
import { setUserSession } from '../utils/session';

export interface BootstrapStatus {
  hasUsers: boolean;
}

export interface InitialAdminPayload {
  fullName: string;
  username: string;
  password: string;
}

export const getBootstrapStatusFn = async (): Promise<BootstrapStatus> => {
  try {
    const status = await window.api.auth.getBootstrapStatus();

    return {
      hasUsers: Boolean(status?.hasUsers),
    };
  } catch (error: any) {
    toast.error(error.message || '');
    return { hasUsers: true };
  }
};

export const createInitialAdminFn = async (
  values: InitialAdminPayload,
  cb?: () => void
): Promise<UserSession | null> => {
  try {
    const user = await window.api.auth.createInitialAdmin(values);
    const session = sanitizeUserSession(user);

    if (!session) {
      throw new Error('Invalid user session');
    }

    setUserSession(session);
    if (cb) cb();
    return session;
  } catch (error: any) {
    toast.error(error.message || '');
    return null;
  }
};
