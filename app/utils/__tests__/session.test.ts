import {
  USER_SESSION_STORAGE_KEY,
  clearUserSession,
  getUserSession,
  setUserSession,
} from '../session';

describe('session utils', () => {
  beforeEach(() => {
    clearUserSession();
    localStorage.clear();
  });

  it('returns null when no session exists', () => {
    expect(getUserSession()).toBeNull();
  });

  it('returns null for malformed json', () => {
    localStorage.setItem(USER_SESSION_STORAGE_KEY, '{bad json');

    expect(getUserSession()).toBeNull();
  });

  it('returns null for the wrong session shape', () => {
    localStorage.setItem(
      USER_SESSION_STORAGE_KEY,
      JSON.stringify({ id: 1, fullName: 'Admin User' })
    );

    expect(getUserSession()).toBeNull();
  });

  it('returns a valid admin session', () => {
    setUserSession({ id: 1, fullName: 'Admin User', role: 'admin' });

    expect(getUserSession()).toEqual({
      id: 1,
      fullName: 'Admin User',
      role: 'admin',
    });
  });

  it('returns a valid non-admin session', () => {
    setUserSession({ id: 2, fullName: 'Cashier User', role: 'cashier' });

    expect(getUserSession()).toEqual({
      id: 2,
      fullName: 'Cashier User',
      role: 'cashier',
    });
  });
});
