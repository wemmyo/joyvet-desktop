// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import CreateCustomer from '../CreateCustomer';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('CreateCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not toast success or clear the form when create fails', async () => {
    const user = userEvent.setup();
    const createCustomerFn = vi.fn().mockResolvedValue(undefined);

    render(<CreateCustomer createCustomerFn={createCustomerFn} />);

    await user.type(screen.getByLabelText('Full Name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(createCustomerFn).toHaveBeenCalled();
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Full Name') as HTMLInputElement).value).toBe(
      'Ada'
    );
  });

  it('clears the form after a successful create without a local success toast', async () => {
    const user = userEvent.setup();
    const createCustomerFn = vi
      .fn()
      .mockResolvedValue({ id: 1, fullName: 'Ada' });

    render(<CreateCustomer createCustomerFn={createCustomerFn} />);

    await user.type(screen.getByLabelText('Full Name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        (screen.getByLabelText('Full Name') as HTMLInputElement).value
      ).toBe('');
    });
    expect(toast.success).not.toHaveBeenCalled();
  });
});
