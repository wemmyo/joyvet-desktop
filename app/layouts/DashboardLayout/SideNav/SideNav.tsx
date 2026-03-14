import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../../components/ui/sidebar';
import routes from '../../../routing/routes';
import { isAdmin } from '../../../utils/helpers';
import { logoutFn } from '../../../controllers/user.controller';

const navItems = [
  { to: routes.INVOICE, label: 'Invoices' },
  { to: routes.SALES, label: 'Sales' },
  { to: routes.PRODUCT, label: 'Products' },
  { to: routes.CUSTOMER, label: 'Customers' },
  { to: routes.SUPPLIER, label: 'Suppliers' },
  { to: routes.RECEIPT, label: 'Receipt' },
  { to: routes.PAYMENT, label: 'Payment' },
  { to: routes.PURCHASE, label: 'Purchase' },
  { to: routes.ALL_PURCHASES, label: 'All Purchases' },
  { to: routes.EXPENSE, label: 'Expenditure' },
];

const SideNav = () => {
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader>
        <h4 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground)/0.6)]">
          Menu
        </h4>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map(({ to, label }) => (
            <SidebarMenuItem key={to}>
              <NavLink to={to}>
                {({ isActive }) => (
                  <SidebarMenuButton asChild={false} isActive={isActive}>
                    {label}
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
          {isAdmin() && (
            <SidebarMenuItem>
              <NavLink to={routes.USER}>
                {({ isActive }) => (
                  <SidebarMenuButton asChild={false} isActive={isActive}>
                    Users
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logoutFn();
                navigate(routes.LOGIN);
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SideNav;
