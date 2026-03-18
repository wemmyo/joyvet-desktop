import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../components/ui/sidebar';
import SideNav from './DashboardLayout/SideNav/SideNav';
import { RightPanelProvider } from '../contexts/SidebarContext';

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
