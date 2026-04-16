// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SupplierHistory from '../SupplierHistory';

const getSupplierPaymentsFn = vi.fn();
const getSupplierPurchasesFn = vi.fn();
const getSupplierActivityTimelineFn = vi.fn();

vi.mock('../../../controllers/supplier.controller', () => ({
  getSupplierPaymentsFn: (...args: unknown[]) => getSupplierPaymentsFn(...args),
  getSupplierPurchasesFn: (...args: unknown[]) =>
    getSupplierPurchasesFn(...args),
  getSupplierActivityTimelineFn: (...args: unknown[]) =>
    getSupplierActivityTimelineFn(...args),
}));

vi.mock('../../../layouts/DashboardLayout/DashboardLayout', () => ({
  default: ({ children, screenTitle }: any) => (
    <div>
      <h1>{screenTitle}</h1>
      {children}
    </div>
  ),
}));

vi.mock('../components/Payments/Payments', () => ({
  default: ({ data }: any) => (
    <div data-testid="payment-results">{data.length}</div>
  ),
}));

vi.mock('../components/Purchases/Purchases', () => ({
  default: ({ data }: any) => (
    <div data-testid="purchase-results">{data.length}</div>
  ),
}));

describe('SupplierHistory route params', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupplierPaymentsFn.mockResolvedValue([]);
    getSupplierPurchasesFn.mockResolvedValue([]);
    getSupplierActivityTimelineFn.mockResolvedValue([]);
  });

  it('loads supplier history for a valid route id', async () => {
    render(
      <MemoryRouter initialEntries={['/supplier/84']}>
        <Routes>
          <Route path="/supplier/:id" element={<SupplierHistory />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getSupplierPaymentsFn).toHaveBeenCalledWith(
        84,
        expect.any(String),
        expect.any(String)
      );
      expect(getSupplierPurchasesFn).toHaveBeenCalledWith(
        84,
        expect.any(String),
        expect.any(String)
      );
    });
  });

  it('renders a fallback for an invalid route id', () => {
    render(
      <MemoryRouter initialEntries={['/supplier/not-a-number']}>
        <Routes>
          <Route path="/supplier/:id" element={<SupplierHistory />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid supplier selected.')).toBeTruthy();
    expect(getSupplierPaymentsFn).not.toHaveBeenCalled();
    expect(getSupplierPurchasesFn).not.toHaveBeenCalled();
  });
});
