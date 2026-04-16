// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CustomerHistory from '../CustomerHistory';

const getCustomerInvoicesFn = vi.fn();
const getCustomerReceiptsFn = vi.fn();
const getCustomerActivityTimelineFn = vi.fn();

vi.mock('../../../controllers/customer.controller', () => ({
  getCustomerInvoicesFn: (...args: unknown[]) => getCustomerInvoicesFn(...args),
  getCustomerReceiptsFn: (...args: unknown[]) => getCustomerReceiptsFn(...args),
  getCustomerActivityTimelineFn: (...args: unknown[]) =>
    getCustomerActivityTimelineFn(...args),
}));

vi.mock('../../../layouts/DashboardLayout/DashboardLayout', () => ({
  default: ({ children, screenTitle }: any) => (
    <div>
      <h1>{screenTitle}</h1>
      {children}
    </div>
  ),
}));

vi.mock('../components/Invoices/Invoices', () => ({
  default: ({ data }: any) => (
    <div data-testid="invoice-results">{data.length}</div>
  ),
}));

vi.mock('../components/Receipts/Receipts', () => ({
  default: ({ data }: any) => (
    <div data-testid="receipt-results">{data.length}</div>
  ),
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn(),
}));

describe('CustomerHistory route params', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCustomerInvoicesFn.mockResolvedValue([]);
    getCustomerReceiptsFn.mockResolvedValue([]);
    getCustomerActivityTimelineFn.mockResolvedValue([]);
  });

  it('loads customer history for a valid route id', async () => {
    render(
      <MemoryRouter initialEntries={['/customer/42']}>
        <Routes>
          <Route path="/customer/:id" element={<CustomerHistory />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getCustomerInvoicesFn).toHaveBeenCalledWith(
        42,
        expect.any(String),
        expect.any(String)
      );
      expect(getCustomerReceiptsFn).toHaveBeenCalledWith(
        42,
        expect.any(String),
        expect.any(String)
      );
    });
  });

  it('renders a fallback for an invalid route id', () => {
    render(
      <MemoryRouter initialEntries={['/customer/not-a-number']}>
        <Routes>
          <Route path="/customer/:id" element={<CustomerHistory />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid customer selected.')).toBeTruthy();
    expect(getCustomerInvoicesFn).not.toHaveBeenCalled();
    expect(getCustomerReceiptsFn).not.toHaveBeenCalled();
  });
});
