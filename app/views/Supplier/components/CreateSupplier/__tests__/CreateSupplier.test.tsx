// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateSupplier from '../CreateSupplier';

describe('CreateSupplier', () => {
  it('resets the form after a successful create', async () => {
    const user = userEvent.setup();
    const createSupplierFn = vi.fn().mockResolvedValue(true);

    render(<CreateSupplier createSupplierFn={createSupplierFn} />);

    await user.type(screen.getByLabelText('Full Name'), 'Acme Feeds');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        (screen.getByLabelText('Full Name') as HTMLInputElement).value
      ).toBe('');
    });
  });

  it('does not reset the form when create fails', async () => {
    const user = userEvent.setup();
    const createSupplierFn = vi.fn().mockResolvedValue(undefined);

    render(<CreateSupplier createSupplierFn={createSupplierFn} />);

    await user.type(screen.getByLabelText('Full Name'), 'Acme Feeds');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(createSupplierFn).toHaveBeenCalled();
    });
    expect(
      (screen.getByLabelText('Full Name') as HTMLInputElement).value
    ).toBe('Acme Feeds');
  });
});
