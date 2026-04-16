// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';

import SalesScreen from '../Sales';

const filterInvoiceFnMock = vi.fn();
const openSideContentMock = vi.fn();
const closeSideContentMock = vi.fn();

vi.mock('../../../layouts/DashboardLayout/DashboardLayout', () => ({
  default: ({
    children,
    headerContent,
    screenTitle,
  }: {
    children: ReactNode;
    headerContent?: ReactNode;
    screenTitle: string;
  }) => (
    <div>
      <h1>{screenTitle}</h1>
      <div>{headerContent}</div>
      <div>{children}</div>
    </div>
  ),
}));

vi.mock('../../../contexts/SidebarContext', () => ({
  useSidebarContext: () => ({
    openSideContent: openSideContentMock,
    closeSideContent: closeSideContentMock,
  }),
}));

vi.mock('../components/SalesDetail', () => ({
  default: () => <div>Sales detail</div>,
}));

vi.mock('../../../controllers/invoice.controller', () => ({
  filterInvoiceFn: (...args: unknown[]) => filterInvoiceFnMock(...args),
}));

describe('SalesScreen', () => {
  const today = dayjs().format('YYYY-MM-DD');
  const defaultInvoices = [
    {
      id: 1,
      customer: { fullName: 'Alice Customer' },
      saleType: 'cash',
      amount: 150,
      profit: 20,
      createdAt: '2026-03-14T10:00:00.000Z',
    },
  ];
  const searchedInvoices = [
    {
      id: 123,
      customer: { fullName: 'Search Match' },
      saleType: 'credit',
      amount: 300,
      profit: 40,
      createdAt: '2026-03-14T12:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    filterInvoiceFnMock.mockImplementation(
      async (query?: { search?: string }) => {
        if (query?.search) {
          return {
            rows: searchedInvoices,
            total: 1,
            page: 1,
            pageSize: 25,
          };
        }

        return {
          rows: defaultInvoices,
          total: 1,
          page: 1,
          pageSize: 25,
        };
      }
    );
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('restores the filtered invoice list when search is cleared or reset', async () => {
    render(<SalesScreen />);

    const user = userEvent.setup();
    const searchInput = screen.getByLabelText('Search');

    expect(await screen.findByText('Alice Customer')).toBeTruthy();
    expect(filterInvoiceFnMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 25,
      startDate: today,
      endDate: today,
      saleType: 'all',
      search: undefined,
    });

    await user.type(searchInput, '123');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(filterInvoiceFnMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 25,
        startDate: today,
        endDate: today,
        saleType: 'all',
        search: '123',
      });
    });
    expect(await screen.findByText('Search Match')).toBeTruthy();

    await user.clear(searchInput);

    await waitFor(() => {
      expect(filterInvoiceFnMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 25,
        startDate: today,
        endDate: today,
        saleType: 'all',
        search: undefined,
      });
    });
    expect(await screen.findByText('Alice Customer')).toBeTruthy();

    await user.type(searchInput, '123');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('Search Match')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(filterInvoiceFnMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 25,
        startDate: today,
        endDate: today,
        saleType: 'all',
        search: undefined,
      });
    });
    expect(await screen.findByText('Alice Customer')).toBeTruthy();
  });
});
