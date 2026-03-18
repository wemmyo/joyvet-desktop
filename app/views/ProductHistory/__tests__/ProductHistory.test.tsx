// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductHistory from '../ProductHistory';

const getProductInvoicesFn = vi.fn();
const getProductPurchasesFn = vi.fn();
const getProductAuditLogFn = vi.fn();

vi.mock('../../../controllers/product.controller', () => ({
  getProductInvoicesFn: (...args: unknown[]) => getProductInvoicesFn(...args),
  getProductPurchasesFn: (...args: unknown[]) =>
    getProductPurchasesFn(...args),
  getProductAuditLogFn: (...args: unknown[]) => getProductAuditLogFn(...args),
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
  default: ({ data }: any) => <div data-testid="invoice-results">{data.length}</div>,
}));

vi.mock('../components/Purchases/Purchases', () => ({
  default: ({ data }: any) => <div data-testid="purchase-results">{data.length}</div>,
}));

describe('ProductHistory route params', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProductInvoicesFn.mockResolvedValue([]);
    getProductPurchasesFn.mockResolvedValue([]);
    getProductAuditLogFn.mockResolvedValue([]);
  });

  it('loads product history for a valid route id', async () => {
    render(
      <MemoryRouter initialEntries={['/product/21']}>
        <Routes>
          <Route path="/product/:id" element={<ProductHistory />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getProductInvoicesFn).toHaveBeenCalledWith(
        21,
        expect.any(String),
        expect.any(String)
      );
      expect(getProductPurchasesFn).toHaveBeenCalledWith(
        21,
        expect.any(String),
        expect.any(String)
      );
    });
  });

  it('renders a fallback for an invalid route id', () => {
    render(
      <MemoryRouter initialEntries={['/product/not-a-number']}>
        <Routes>
          <Route path="/product/:id" element={<ProductHistory />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid product selected.')).toBeTruthy();
    expect(getProductInvoicesFn).not.toHaveBeenCalled();
    expect(getProductPurchasesFn).not.toHaveBeenCalled();
  });
});
