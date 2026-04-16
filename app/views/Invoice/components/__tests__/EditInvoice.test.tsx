// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MAX_PAGE_SIZE } from '../../../../types/pagination';
import EditInvoice from '../EditInvoice';

const getSingleInvoiceFn = vi.fn();
const getProductsFn = vi.fn();
const searchProductFn = vi.fn();
const deleteInvoiceItemFn = vi.fn();
const addInvoiceItemFn = vi.fn();

vi.mock('../../../../controllers/invoice.controller', () => ({
  getSingleInvoiceFn: (...args: unknown[]) => getSingleInvoiceFn(...args),
  deleteInvoiceItemFn: (...args: unknown[]) => deleteInvoiceItemFn(...args),
  addInvoiceItemFn: (...args: unknown[]) => addInvoiceItemFn(...args),
}));

vi.mock('../../../../controllers/product.controller', () => ({
  getProductsFn: (...args: unknown[]) => getProductsFn(...args),
  searchProductFn: (...args: unknown[]) => searchProductFn(...args),
}));

vi.mock('../../../../layouts/DashboardLayout/DashboardLayout', () => ({
  default: ({ children, screenTitle }: any) => (
    <div>
      <h1>{screenTitle}</h1>
      {children}
    </div>
  ),
}));

vi.mock('../../../../components/PrintedReceipt/ReceiptWrapper', () => ({
  default: React.forwardRef(() => <div />),
}));

vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn(),
}));

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

describe('EditInvoice route params', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'ResizeObserver', {
      writable: true,
      value: ResizeObserverMock,
    });
    HTMLElement.prototype.hasPointerCapture = () => false;
    HTMLElement.prototype.setPointerCapture = () => {};
    HTMLElement.prototype.releasePointerCapture = () => {};
    HTMLElement.prototype.scrollIntoView = () => {};
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getProductsFn.mockResolvedValue({
      rows: [
        {
          id: 10,
          title: 'Test Product',
          buyPrice: 50,
          sellPrice: 100,
          sellPrice2: 90,
          sellPrice3: 80,
          stock: 20,
          reorderLevel: 2,
        },
      ],
      total: 1,
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
    searchProductFn.mockResolvedValue({
      rows: [],
      total: 0,
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
    addInvoiceItemFn.mockResolvedValue(undefined);
    getSingleInvoiceFn.mockResolvedValue({
      id: 5,
      customer: { id: 3, fullName: 'Customer Name', maxPriceLevel: 2 },
      saleType: 'cash',
      createdAt: new Date().toISOString(),
      products: [],
    });
  });

  it('loads invoice data for a valid route id', async () => {
    render(
      <MemoryRouter initialEntries={['/invoice/5']}>
        <Routes>
          <Route path="/invoice/:id" element={<EditInvoice />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getSingleInvoiceFn).toHaveBeenCalledWith(5);
    });
  });

  it('adds an item using the cached product resolved from the combobox selection', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/invoice/5']}>
        <Routes>
          <Route path="/invoice/:id" element={<EditInvoice />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getSingleInvoiceFn).toHaveBeenCalledWith(5);
    });

    await user.click(screen.getByRole('combobox', { name: 'Select Product' }));

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Test Product' })).toBeTruthy();
    });

    await user.click(screen.getByRole('option', { name: 'Test Product' }));
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Test Product' })
      ).toBeTruthy();
    });

    const unitPriceSection =
      screen.getAllByText('Unit Price')[1]?.parentElement;
    const priceTrigger = unitPriceSection?.querySelector(
      'button[role="combobox"]'
    );

    expect(priceTrigger).toBeTruthy();
    await user.click(priceTrigger as HTMLElement);
    await user.click(screen.getByRole('option', { name: /Level 1: ₦100/ }));
    await user.type(screen.getByPlaceholderText('Quantity'), '2');
    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    await waitFor(() => {
      expect(addInvoiceItemFn).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5 }),
        expect.objectContaining({
          quantity: 2,
          unitPrice: 100,
          amount: 200,
          product: expect.objectContaining({
            id: 10,
            title: 'Test Product',
          }),
        })
      );
    });
  });

  it('renders a fallback for an invalid route id', () => {
    render(
      <MemoryRouter initialEntries={['/invoice/not-a-number']}>
        <Routes>
          <Route path="/invoice/:id" element={<EditInvoice />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid invoice selected.')).toBeTruthy();
    expect(getProductsFn).not.toHaveBeenCalled();
    expect(getSingleInvoiceFn).not.toHaveBeenCalled();
  });
});
