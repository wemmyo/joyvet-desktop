// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { SidebarProvider } from '../../../components/ui/sidebar';
import { USER_SESSION_STORAGE_KEY } from '../../../utils/session';
import DashboardLayout from '../DashboardLayout';

const closeSideContentMock = vi.fn();

vi.mock('../../../contexts/SidebarContext', () => ({
  useSidebarContext: () => ({
    sideContentisOpen: true,
    closeSideContent: closeSideContentMock,
  }),
}));

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

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockMatchMedia(false);
    localStorage.setItem(
      USER_SESSION_STORAGE_KEY,
      JSON.stringify({
        id: 1,
        fullName: 'Joy Vet',
        role: 'admin',
      })
    );
  });

  it('renders the sidebar shell, trigger, main content, and right sidebar content', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/invoice']}>
        <SidebarProvider>
          <DashboardLayout
            screenTitle="Invoices"
            headerContent={<div>Header actions</div>}
            rightSidebar={<div>Details panel body</div>}
          >
            <div>Page body</div>
          </DashboardLayout>
        </SidebarProvider>
      </MemoryRouter>
    );

    expect(container.querySelector('[data-sidebar="inset"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeTruthy();
    expect(screen.getByText('Header actions')).toBeTruthy();
    expect(screen.getByText('Page body')).toBeTruthy();
    expect(screen.getByText('Details panel body')).toBeTruthy();
  });
});
