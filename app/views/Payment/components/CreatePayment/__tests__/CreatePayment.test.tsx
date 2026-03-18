// @vitest-environment jsdom

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreatePayment from '../CreatePayment';
import { MAX_PAGE_SIZE } from '../../../../../types/pagination';

const getSuppliersFn = vi.fn();
const searchSupplierFn = vi.fn();

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

vi.mock('../../../../../controllers/supplier.controller', () => ({
  getSuppliersFn: (...args: unknown[]) => getSuppliersFn(...args),
  searchSupplierFn: (...args: unknown[]) => searchSupplierFn(...args),
}));

vi.mock('../../../../../controllers/payment.controller', () => ({
  createPaymentFn: vi.fn(),
}));

describe('CreatePayment', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'ResizeObserver', {
      writable: true,
      value: ResizeObserverMock,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getSuppliersFn.mockResolvedValue({
      rows: [{ id: 1, fullName: 'Alpha Supplier', balance: 25 }],
      total: 1,
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
    searchSupplierFn.mockResolvedValue({
      rows: [{ id: 9, fullName: 'Zulu Supplier', balance: 450 }],
      total: 1,
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
  });

  it('finds a supplier outside the initial option list and shows the balance', async () => {
    const user = userEvent.setup();

    render(<CreatePayment refreshPayments={vi.fn()} />);

    await user.click(screen.getByRole('combobox', { name: 'Select Supplier' }));

    await waitFor(() => {
      expect(getSuppliersFn).toHaveBeenCalledWith({ pageSize: MAX_PAGE_SIZE });
    });

    await user.type(screen.getByPlaceholderText('Search suppliers'), 'Zulu');

    await waitFor(() => {
      expect(searchSupplierFn).toHaveBeenCalledWith({
        pageSize: MAX_PAGE_SIZE,
        search: 'Zulu',
      });
    });

    await user.click(
      await screen.findByRole('option', { name: 'Zulu Supplier' })
    );

    expect(await screen.findByText('Balance: 450.00')).toBeTruthy();
  });
});
