// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../types/pagination';
import UserScreen from '../User';

const getUsersFn = vi.fn();
const createUserFn = vi.fn();

vi.mock('../../../controllers/user.controller', () => ({
  getUsersFn: (...args: unknown[]) => getUsersFn(...args),
  createUserFn: (...args: unknown[]) => createUserFn(...args),
}));

vi.mock('../../../contexts/SidebarContext', () => ({
  useSidebarContext: () => ({
    openSideContent: vi.fn(),
    closeSideContent: vi.fn(),
  }),
}));

vi.mock('../../../layouts/DashboardLayout/DashboardLayout', () => ({
  default: ({
    children,
    screenTitle,
  }: {
    children?: ReactNode;
    screenTitle?: string;
  }) => (
    <div>
      <h1>{screenTitle}</h1>
      {children}
    </div>
  ),
}));

vi.mock('../components/CreateUser/CreateUser', () => ({
  default: () => null,
}));

vi.mock('../components/EditUser/EditUser', () => ({
  default: () => null,
}));

vi.mock('../../../components/PaginationControls/PaginationControls', () => ({
  default: () => <div>Pagination</div>,
}));

describe('UserScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty row when there are no users', async () => {
    getUsersFn.mockResolvedValue({ rows: [], total: 0 });

    render(
      <MemoryRouter>
        <UserScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getUsersFn).toHaveBeenCalledWith({
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
      });
    });

    expect(screen.getByText('No users found.')).toBeTruthy();
  });
});
