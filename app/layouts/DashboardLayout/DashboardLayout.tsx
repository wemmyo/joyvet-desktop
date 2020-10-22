import React, { useState } from 'react';
import Sidebar from './SideNav/SideNav';
import styles from './DashboardLayout.css';
import HeaderSection from './HeaderSection/HeaderSection';
import { Button } from 'semantic-ui-react';

export interface DashboardLayoutProps {
  children?: any;
  screenTitle: string;
  rightSidebar?: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  screenTitle,
  rightSidebar,
}) => {
  const [rightSidebarIsOpen, setRightSidebarIsOpen] = useState(false);

  const openRightSidebar = () => {
    setRightSidebarIsOpen(true);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1 }}>
        <div className={styles.main}>
          <HeaderSection
            openRightSidebarFn={openRightSidebar}
            screenTitle={screenTitle}
          />
          {children}
        </div>
        <div
          className={`${styles.rightSidebar} ${
            rightSidebarIsOpen
              ? styles.rightSidebar__open
              : styles.rightSidebar__close
          }`}
        >
          <div style={{ marginBottom: '2rem' }}>
            <Button
              content="Close"
              onClick={() => setRightSidebarIsOpen(false)}
            />
          </div>

          {rightSidebar}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
