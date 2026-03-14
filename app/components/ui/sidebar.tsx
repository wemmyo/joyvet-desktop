import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

const SIDEBAR_WIDTH = '16rem';

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  open: true,
  setOpen: () => {},
  toggleSidebar: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggleSidebar = () => setOpen((v) => !v);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            display: 'flex',
            minHeight: '100svh',
            width: '100%',
          } as React.CSSProperties
        }
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
  const { open } = useSidebar();

  return (
    <div
      data-state={open ? 'expanded' : 'collapsed'}
      style={{
        width: open ? SIDEBAR_WIDTH : '0',
        minWidth: open ? SIDEBAR_WIDTH : '0',
        transition: 'width 200ms ease, min-width 200ms ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      {...props}
    >
      <div
        className={cn(
          'flex h-full flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]',
          className
        )}
        style={{ width: SIDEBAR_WIDTH }}
      >
        {children}
      </div>
    </div>
  );
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-2 p-4', className)} {...props} />
  );
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-1 flex-col gap-2 overflow-auto p-2', className)}
      {...props}
    />
  );
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-2 p-4', className)} {...props} />
  );
}

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn('flex flex-col gap-1 list-none m-0 p-0', className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props} />;
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]',
        isActive &&
          'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]',
        className
      )}
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
      className={cn('h-8 w-8', className)}
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
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-1 flex-col overflow-auto', className)}
      {...props}
    />
  );
}
