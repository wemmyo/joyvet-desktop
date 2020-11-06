import React from 'react';
import Sidebar from './SideNav/SideNav';
import styles from './DashboardLayout.css';
import HeaderSection from './HeaderSection/HeaderSection';
import { Button } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDashboardState,
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';

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
  const dispatch = useDispatch();
  const dashboardState = useSelector(selectDashboardState);
  const { sideContentisOpen } = dashboardState;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1 }}>
        <div className={styles.main}>
          <HeaderSection
            openRightSidebarFn={() => dispatch(openSideContentFn())}
            screenTitle={screenTitle}
          />
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
