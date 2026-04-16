import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';

const SIDEBAR_WIDTH = '16rem';
const MOBILE_BREAKPOINT = '(max-width: 767px)';

interface SidebarContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

const getIsMobile = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false;
  }

  return window.matchMedia(MOBILE_BREAKPOINT).matches;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(getIsMobile);

  React.useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const updateIsMobile = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    updateIsMobile(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateIsMobile);
      return () => mediaQuery.removeEventListener('change', updateIsMobile);
    }

    mediaQuery.addListener(updateIsMobile);
    return () => mediaQuery.removeListener(updateIsMobile);
  }, []);

  return isMobile;
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }

  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((currentOpen) => !currentOpen);
      return;
    }

    setOpen((currentOpen) => !currentOpen);
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile]);

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <div
        className="relative flex min-h-svh w-full bg-background text-foreground"
        style={{ '--sidebar-width': SIDEBAR_WIDTH } as React.CSSProperties}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

  const sidebarContent = (
    <div
      data-sidebar="sidebar"
      data-state={open ? 'expanded' : 'collapsed'}
      className={cn(
        'flex h-full w-full md:w-[var(--sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            data-sidebar="sidebar"
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 w-[min(var(--sidebar-width),85vw)] border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
            {...props}
          >
            <DialogPrimitive.Title className="sr-only">
              Sidebar navigation
            </DialogPrimitive.Title>
            {sidebarContent}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <div
      data-sidebar="sidebar-container"
      data-state={open ? 'expanded' : 'collapsed'}
      className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] transition-transform duration-200 ease-out md:block"
      style={{
        transform: open
          ? 'translateX(0)'
          : 'translateX(calc(-1 * var(--sidebar-width)))',
      }}
      {...props}
    >
      {sidebarContent}
    </div>
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-3',
        className
      )}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar="footer"
      className={cn('flex flex-col gap-3 p-4', className)}
      {...props}
    />
  );
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      data-sidebar="group"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        'px-2 text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60',
        className
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar="group-content"
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      data-sidebar="menu"
      className={cn('m-0 flex list-none flex-col gap-1 p-0', className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li data-sidebar="menu-item" className={cn(className)} {...props} />;
}

interface SidebarMenuButtonProps
  extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  isActive?: boolean;
  size?: 'default' | 'lg';
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = 'default',
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-sidebar-foreground outline-none transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground',
        'aria-[current=page]:bg-sidebar-primary aria-[current=page]:text-sidebar-primary-foreground',
        size === 'lg' ? 'min-h-12 py-3' : 'min-h-10 py-2.5',
        className
      )}
      {...props}
    />
  );
}

export function SidebarSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar="separator"
      className={cn('mx-2 h-px bg-sidebar-border', className)}
      {...props}
    />
  );
}

export function SidebarRail({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-sidebar="rail"
      aria-hidden="true"
      className={cn('hidden w-full md:block', className)}
      {...props}
    />
  );
}

export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-9 w-9', className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

export function SidebarInset({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile, open } = useSidebar();

  return (
    <div
      data-sidebar="inset"
      className={cn(
        'flex min-h-svh min-w-0 flex-1 flex-col overflow-hidden transition-[margin-left] duration-200 ease-out',
        className
      )}
      style={{
        marginLeft: isMobile ? 0 : open ? SIDEBAR_WIDTH : 0,
        ...style,
      }}
      {...props}
    />
  );
}
