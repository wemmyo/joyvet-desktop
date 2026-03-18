// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LoginForm from '../LoginForm';

const navigateMock = vi.fn();
const loginUserFnMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../../../../../controllers/user.controller', () => ({
  loginUserFn: (...args: unknown[]) => loginUserFnMock(...args),
}));

describe('LoginForm', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('does not navigate or reset the form when login fails', async () => {
    loginUserFnMock.mockResolvedValue(null);

    render(<LoginForm />);

    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginUserFnMock).toHaveBeenCalledWith({
        username: 'admin',
        password: 'wrong-password',
      });
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect((usernameInput as HTMLInputElement).value).toBe('admin');
    expect((passwordInput as HTMLInputElement).value).toBe('wrong-password');
  });

  it('navigates and resets the form when login succeeds', async () => {
    loginUserFnMock.mockResolvedValue({
      id: 1,
      fullName: 'Admin User',
      role: 'admin',
    });

    render(<LoginForm />);

    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin-password');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/invoice');
    });

    expect((usernameInput as HTMLInputElement).value).toBe('');
    expect((passwordInput as HTMLInputElement).value).toBe('');
  });
});
