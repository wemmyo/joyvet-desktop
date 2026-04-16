// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import {
  SidebarProvider,
  SidebarTrigger,
} from '../../../../components/ui/sidebar';
import routes from '../../../../routing/routes';
import { USER_SESSION_STORAGE_KEY } from '../../../../utils/session';

const navigateMock = vi.fn();
const logoutFnMock = vi.fn();
const preloadRouteMock = vi.fn();
const preloadRoutesMock = vi.fn().mockResolvedValue([]);

vi.mock('../../../../controllers/user.controller', () => ({
  logoutFn: () => logoutFnMock(),
}));

vi.mock('../../../../routing/routeScreens', () => ({
  preloadRoute: (...args: unknown[]) => preloadRouteMock(...args),
  preloadRoutes: (...args: unknown[]) => preloadRoutesMock(...args),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import SideNav from '../SideNav';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 767px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const renderSideNav = (initialEntry = routes.INVOICE) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SidebarProvider>
        <SidebarTrigger />
        <SideNav />
      </SidebarProvider>
    </MemoryRouter>
  );

const setUserSession = (role: string) => {
  localStorage.setItem(
    USER_SESSION_STORAGE_KEY,
    JSON.stringify({
      id: 1,
      fullName: 'Joy Vet',
      role,
    })
  );
};

describe('SideNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockMatchMedia(false);
  });

  it('renders grouped nav items and highlights the active route', () => {
    setUserSession('admin');

    renderSideNav(routes.INVOICE);

    expect(screen.getByText('Operations')).toBeTruthy();
    expect(screen.getByText('Finance')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Users' })).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Invoices' })
        .getAttribute('aria-current')
    ).toBe('page');
  });

  it('hides admin items for non-admin users', () => {
    setUserSession('staff');

    renderSideNav(routes.SALES);

    expect(screen.queryByRole('link', { name: 'Users' })).toBeNull();
    expect(screen.queryByText('Admin')).toBeNull();
  });

  it('logs out and redirects to login', async () => {
    setUserSession('admin');

    const user = userEvent.setup();
    renderSideNav(routes.SALES);

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(logoutFnMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(routes.LOGIN);
  });

  it('preloads route chunks before navigation', async () => {
    setUserSession('admin');

    const user = userEvent.setup();
    renderSideNav(routes.INVOICE);

    await user.hover(screen.getByRole('link', { name: 'Sales' }));

    expect(preloadRouteMock).toHaveBeenCalledWith(routes.SALES);
  });

  it('closes the mobile overlay after navigation', async () => {
    setUserSession('staff');
    mockMatchMedia(true);

    const user = userEvent.setup();
    renderSideNav(routes.INVOICE);

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Sales' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
