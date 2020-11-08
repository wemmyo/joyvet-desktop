import React from 'react';
import { Button } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectDashboardState,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import Sidebar from './SideNav/SideNav';
import styles from './DashboardLayout.css';

export interface DashboardLayoutProps {
  children?: any;
  screenTitle: string;
  rightSidebar?: any;
  headerContent?: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  screenTitle,
  rightSidebar,
  headerContent,
}) => {
  const dispatch = useDispatch();
  const dashboardState = useSelector(selectDashboardState);
  const { sideContentisOpen } = dashboardState;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1 }}>
        <div className={styles.main}>
          <header className={styles.headerSection}>
            <h2 className={styles.headerSection__title}>{screenTitle}</h2>
            <div className={styles.headerSection__right}>{headerContent}</div>
          </header>
          {children}
        </div>
        <div
          className={`${styles.rightSidebar} ${
            sideContentisOpen
              ? styles.rightSidebar__open
              : styles.rightSidebar__close
          }`}
        >
          <div style={{ marginBottom: '2rem' }}>
            <Button
              content="Close"
              onClick={() => {
                dispatch(closeSideContentFn());
              }}
            />
          </div>

          {rightSidebar}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
