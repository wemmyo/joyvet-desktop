// @vitest-environment jsdom

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AsyncCombobox from '../async-combobox';

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

describe('AsyncCombobox', () => {
  beforeAll(() => {
    Object.defineProperty(global, 'ResizeObserver', {
      writable: true,
      value: ResizeObserverMock,
    });
  });

  it('loads initial options, searches, and selects an option', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onValueChange = vi.fn();

    render(
      <AsyncCombobox
        value=""
        onValueChange={onValueChange}
        placeholder="Select Customer"
        searchPlaceholder="Search customers"
        options={[
          { value: '1', label: 'Alpha Customer' },
          { value: '2', label: 'Beta Customer' },
        ]}
        loading={false}
        emptyMessage="No customers found."
        onSearchChange={onSearchChange}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Select Customer' }));

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('');
    });

    await user.type(screen.getByPlaceholderText('Search customers'), 'Beta');

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenLastCalledWith('Beta');
    });

    await user.click(screen.getByRole('option', { name: 'Beta Customer' }));

    expect(onValueChange).toHaveBeenCalledWith('2');
  });

  it('shows loading and empty states and keeps the selected label visible', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AsyncCombobox
        value="2"
        onValueChange={vi.fn()}
        placeholder="Select Supplier"
        searchPlaceholder="Search suppliers"
        selectedLabel="Beta Supplier"
        options={[]}
        loading={true}
        emptyMessage="No suppliers found."
        onSearchChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Beta Supplier' })
    ).toBeTruthy();
    await user.click(screen.getByRole('combobox', { name: 'Beta Supplier' }));
    expect(screen.getByText('Loading...')).toBeTruthy();

    rerender(
      <AsyncCombobox
        value="2"
        onValueChange={vi.fn()}
        placeholder="Select Supplier"
        searchPlaceholder="Search suppliers"
        selectedLabel="Beta Supplier"
        options={[]}
        loading={false}
        emptyMessage="No suppliers found."
        onSearchChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole('combobox', { name: 'Beta Supplier' })
    ).toBeTruthy();
    expect(screen.getByText('No suppliers found.')).toBeTruthy();
  });
});
