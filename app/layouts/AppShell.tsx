import type React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../components/ui/sidebar';
import { RightPanelProvider } from '../contexts/SidebarContext';
import SideNav from './DashboardLayout/SideNav/SideNav';

const AppShell: React.FC = () => {
  return (
    <SidebarProvider>
      <RightPanelProvider>
        <SideNav />
        <Outlet />
      </RightPanelProvider>
    </SidebarProvider>
  );
};

export default AppShell;
