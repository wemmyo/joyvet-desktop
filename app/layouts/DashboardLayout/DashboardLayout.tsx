import * as React from 'react';
import Sidebar from './Sidebar/Sidebar';
import Main from './Main/Main';

// export interface DashboardLayoutProps {}

const DashboardLayout = () => {
  return (
    <div>
      <Sidebar />
      <Main />
    </div>
  );
};

export default DashboardLayout;
