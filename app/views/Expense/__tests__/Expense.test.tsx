// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import ExpensesScreen from '../Expense';

const filterExpensesFn = vi.fn();
const createExpenseFn = vi.fn();

vi.mock('../../../controllers/expense.controller', () => ({
  filterExpensesFn: (...args: unknown[]) => filterExpensesFn(...args),
  createExpenseFn: (...args: unknown[]) => createExpenseFn(...args),
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

vi.mock('../components/CreateExpense/CreateExpense', () => ({
  default: () => null,
}));

vi.mock('../components/EditExpense/EditExpense', () => ({
  default: () => null,
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn(),
}));

describe('ExpensesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty state when there are no expenses', async () => {
    filterExpensesFn.mockResolvedValue([]);

    render(<ExpensesScreen />);

    await waitFor(() => {
      expect(filterExpensesFn).toHaveBeenCalledWith({
        startDate: expect.any(String),
        endDate: expect.any(String),
      });
    });

    expect(screen.getByText('No expenses found.')).toBeTruthy();
  });

  it('renders grouped expense tables with per-group totals', async () => {
    filterExpensesFn.mockResolvedValue([
      {
        id: 1,
        type: 'Fuel',
        amount: 1500,
        date: '2026-03-14T00:00:00.000Z',
        note: 'Generator',
      },
      {
        id: 2,
        type: 'Fuel',
        amount: 500,
        date: '2026-03-14T00:00:00.000Z',
        note: 'Vehicle',
      },
      {
        id: 3,
        type: 'Utilities',
        amount: 2000,
        date: '2026-03-14T00:00:00.000Z',
        note: 'Water',
      },
    ]);

    render(<ExpensesScreen />);

    expect(await screen.findByText('FUEL')).toBeTruthy();
    expect(screen.getByText('UTILITIES')).toBeTruthy();
    expect(screen.getByText('Generator')).toBeTruthy();
    expect(screen.getByText('Vehicle')).toBeTruthy();
    expect(screen.getByText('Water')).toBeTruthy();
    expect(screen.getAllByRole('table')).toHaveLength(2);
    expect(screen.getAllByText('Total')).toHaveLength(2);
  });
});
