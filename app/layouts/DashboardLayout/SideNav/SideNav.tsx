import {
  BadgeDollarSign,
  BarChart2,
  ClipboardList,
  CreditCard,
  DatabaseBackup,
  LogOut,
  Package,
  ReceiptText,
  ShoppingBag,
  Stethoscope,
  Store,
  Truck,
  Users,
} from 'lucide-react';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '../../../components/ui/sidebar';
import { logoutFn } from '../../../controllers/user.controller';
import { preloadRoute } from '../../../routing/routeScreens';
import routes from '../../../routing/routes';
import { getUserSession } from '../../../utils/session';

type NavItem = {
  to: string;
  label: string;
  icon: typeof Package;
};

const operationsNavItems: NavItem[] = [
  { to: routes.INVOICE, label: 'Invoices', icon: ClipboardList },
  { to: routes.SALES, label: 'Sales', icon: BadgeDollarSign },
  { to: routes.PRODUCT, label: 'Products', icon: Package },
  { to: routes.CUSTOMER, label: 'Customers', icon: Users },
  { to: routes.SUPPLIER, label: 'Suppliers', icon: Truck },
];

const financeNavItems: NavItem[] = [
  { to: routes.RECEIPT, label: 'Receipt', icon: ReceiptText },
  { to: routes.PAYMENT, label: 'Payment', icon: CreditCard },
  { to: routes.PURCHASE, label: 'Purchase', icon: ShoppingBag },
  { to: routes.ALL_PURCHASES, label: 'All Purchases', icon: ClipboardList },
  { to: routes.EXPENSE, label: 'Expenditure', icon: BadgeDollarSign },
];

const systemNavItems: NavItem[] = [
  { to: routes.BACKUP, label: 'Backup', icon: DatabaseBackup },
];

const adminNavItems: NavItem[] = [
  { to: routes.USER, label: 'Users', icon: Users },
  { to: routes.STORE_INFO, label: 'Store Info', icon: Store },
  { to: routes.ANALYTICS, label: 'Analytics', icon: BarChart2 },
];

const renderNavGroup = (
  title: string,
  items: NavItem[],
  onNavigate: () => void,
  onPreload: (route: string) => void
) => (
  <SidebarGroup>
    <SidebarGroupLabel>{title}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map(({ to, label, icon: Icon }) => (
          <SidebarMenuItem key={to}>
            <SidebarMenuButton asChild>
              <NavLink
                to={to}
                onClick={onNavigate}
                onMouseEnter={() => onPreload(to)}
                onFocus={() => onPreload(to)}
                onPointerDown={() => onPreload(to)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

const SideNav = () => {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const user = getUserSession();
  const userFullName = user?.fullName ?? 'Workspace User';
  const userRole = user?.role ?? 'staff';
  const userInitials = userFullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? '')
    .join('');
  const isAdminUser = userRole === 'admin';

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handlePreload = (route: string) => {
    void preloadRoute(route);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/50 shadow-sm"
            >
              <button type="button" onClick={handleNavigate}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                  <span className="truncate font-semibold">Joyvet Sales</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Dashboard workspace
                  </span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-5 px-3 py-4">
        {renderNavGroup(
          'Operations',
          operationsNavItems,
          handleNavigate,
          handlePreload
        )}
        <SidebarSeparator />
        {renderNavGroup(
          'Finance',
          financeNavItems,
          handleNavigate,
          handlePreload
        )}
        <SidebarSeparator />
        {renderNavGroup(
          'System',
          systemNavItems,
          handleNavigate,
          handlePreload
        )}
        {isAdminUser ? (
          <>
            <SidebarSeparator />
            {renderNavGroup(
              'Admin',
              adminNavItems,
              handleNavigate,
              handlePreload
            )}
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/40 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-sidebar-border/80">
              <AvatarFallback className="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                {userInitials || 'JV'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userFullName}</p>
              <p className="truncate text-xs capitalize text-sidebar-foreground/65">
                {userRole}
              </p>
            </div>
          </div>

          <SidebarMenu className="mt-3">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={async () => {
                  await logoutFn();
                  navigate(routes.LOGIN);
                }}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default SideNav;
