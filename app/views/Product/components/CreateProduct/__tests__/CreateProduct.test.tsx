// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateProduct from '../CreateProduct';

describe('CreateProduct', () => {
  it('resets the form after a successful create', async () => {
    const user = userEvent.setup();
    const createProductFn = vi.fn().mockResolvedValue(true);
    const refreshProducts = vi.fn();

    render(
      <CreateProduct
        createProductFn={createProductFn}
        refreshProducts={refreshProducts}
      />
    );

    await user.type(screen.getByLabelText('Product Name'), 'Amoxil');
    await user.type(screen.getByPlaceholderText('Sell Price'), '500');
    await user.type(screen.getByPlaceholderText('Sell Price 2'), '480');
    await user.type(screen.getByPlaceholderText('Sell Price 3'), '460');
    await user.type(screen.getByPlaceholderText('Buy Price'), '300');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(refreshProducts).toHaveBeenCalled();
      expect(
        (screen.getByLabelText('Product Name') as HTMLInputElement).value
      ).toBe('');
    });
  });

  it('does not reset the form when create fails', async () => {
    const user = userEvent.setup();
    const createProductFn = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateProduct
        createProductFn={createProductFn}
        refreshProducts={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText('Product Name'), 'Amoxil');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(createProductFn).toHaveBeenCalled();
    });
    expect(
      (screen.getByLabelText('Product Name') as HTMLInputElement).value
    ).toBe('Amoxil');
  });
});
