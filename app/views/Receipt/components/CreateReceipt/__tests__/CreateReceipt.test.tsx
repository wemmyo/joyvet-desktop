// @vitest-environment jsdom

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateReceipt from '../CreateReceipt';
import { MAX_PAGE_SIZE } from '../../../../../types/pagination';

const getCustomersFn = vi.fn();
const searchCustomerFn = vi.fn();
const getReceiptsFn = vi.fn();
const createReceiptFn = vi.fn();

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

vi.mock('../../../../../controllers/customer.controller', () => ({
  getCustomersFn: (...args: unknown[]) => getCustomersFn(...args),
  searchCustomerFn: (...args: unknown[]) => searchCustomerFn(...args),
}));

vi.mock('../../../../../controllers/receipt.controller', () => ({
  getReceiptsFn: (...args: unknown[]) => getReceiptsFn(...args),
  createReceiptFn: (...args: unknown[]) => createReceiptFn(...args),
}));

describe('CreateReceipt', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'ResizeObserver', {
      writable: true,
      value: ResizeObserverMock,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getCustomersFn.mockResolvedValue({
      rows: [{ id: 1, fullName: 'Alpha Customer', balance: 25 }],
      total: 1,
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
    searchCustomerFn.mockResolvedValue({
      rows: [{ id: 2, fullName: 'Beta Customer', balance: 150 }],
      total: 1,
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
  });

  it('finds a customer outside the initial option list and shows the balance', async () => {
    const user = userEvent.setup();

    render(<CreateReceipt />);

    await user.click(screen.getByRole('combobox', { name: 'Select Customer' }));

    await waitFor(() => {
      expect(getCustomersFn).toHaveBeenCalledWith({ pageSize: MAX_PAGE_SIZE });
    });

    await user.type(screen.getByPlaceholderText('Search customers'), 'Beta');

    await waitFor(() => {
      expect(searchCustomerFn).toHaveBeenCalledWith({
        pageSize: MAX_PAGE_SIZE,
        search: 'Beta',
      });
    });

    await user.click(
      await screen.findByRole('option', { name: 'Beta Customer' })
    );

    expect(await screen.findByText('Balance: 150.00')).toBeTruthy();
  });
});
