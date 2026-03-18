import { sanitizeUserSession, type UserSession } from '../types/session';

export const USER_SESSION_STORAGE_KEY = 'user:v1';
const LEGACY_USER_SESSION_STORAGE_KEY = 'user';

const getStorageItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const removeStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors so auth checks fail closed.
  }
};

const parseUserSession = (rawValue: string | null) => {
  if (!rawValue) {
    return null;
  }

  try {
    return sanitizeUserSession(JSON.parse(rawValue));
  } catch {
    return null;
  }
};

export const getUserSession = (): UserSession | null => {
  const currentSession = parseUserSession(
    getStorageItem(USER_SESSION_STORAGE_KEY)
  );

  if (currentSession) {
    return currentSession;
  }

  const legacySession = parseUserSession(
    getStorageItem(LEGACY_USER_SESSION_STORAGE_KEY)
  );

  if (legacySession) {
    setUserSession(legacySession);
    removeStorageItem(LEGACY_USER_SESSION_STORAGE_KEY);
  }

  return legacySession;
};

export const setUserSession = (session: UserSession) => {
  try {
    localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
    removeStorageItem(LEGACY_USER_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors so login can fail gracefully.
  }
};

export const clearUserSession = () => {
  removeStorageItem(USER_SESSION_STORAGE_KEY);
  removeStorageItem(LEGACY_USER_SESSION_STORAGE_KEY);
};
