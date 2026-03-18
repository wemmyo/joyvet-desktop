// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '../sidebar';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 767px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const MobileCloseButton = () => {
  const { setOpenMobile } = useSidebar();

  return (
    <button type="button" onClick={() => setOpenMobile(false)}>
      Close mobile sidebar
    </button>
  );
};

const TestSidebar = () => (
  <SidebarProvider>
    <SidebarTrigger />
    <Sidebar>
      <SidebarContent>
        <span>Sidebar content</span>
        <MobileCloseButton />
      </SidebarContent>
    </Sidebar>
    <SidebarInset>Inset content</SidebarInset>
  </SidebarProvider>
);

describe('sidebar primitives', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('collapses and expands the fixed desktop sidebar', async () => {
    mockMatchMedia(false);

    const user = userEvent.setup();
    const { container } = render(<TestSidebar />);
    const sidebar = container.querySelector('[data-sidebar="sidebar-container"]');
    const inset = container.querySelector('[data-sidebar="inset"]');

    expect(sidebar?.getAttribute('data-state')).toBe('expanded');
    expect((inset as HTMLElement | null)?.style.marginLeft).toBe('16rem');

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

    expect(sidebar?.getAttribute('data-state')).toBe('collapsed');
    expect((inset as HTMLElement | null)?.style.marginLeft).toBe('0px');
  });

  it('opens and closes the mobile sidebar as an overlay', async () => {
    mockMatchMedia(true);

    const user = userEvent.setup();
    render(<TestSidebar />);

    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Toggle sidebar' }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Sidebar content')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Close mobile sidebar' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
