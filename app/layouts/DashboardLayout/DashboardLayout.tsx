import * as React from 'react';
import Sidebar from './SideNav/SideNav';
import styles from './DashboardLayout.css';
import HeaderSection from './HeaderSection/HeaderSection';

export interface DashboardLayoutProps {
  children?: any;
  screenTitle: string;
}

const DashboardLayout: React.SFC<DashboardLayoutProps> = ({
  children,
  screenTitle,
}) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className={styles.main}>
        <HeaderSection screenTitle={screenTitle} />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
