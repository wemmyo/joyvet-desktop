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
}: DashboardLayoutProps) => {
  const dispatch = useDispatch();
  const dashboardState = useSelector(selectDashboardState);

  const { sideContentisOpen } = dashboardState;

  const user =
    localStorage.getItem('user') !== null
      ? JSON.parse(localStorage.getItem('user') || '')
      : '';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1 }}>
        <div className={styles.main}>
          <header>
            <div className={styles.headerSection1}>
              <h2 className={styles.headerSection1__title}>{screenTitle}</h2>
              <div className={styles.headerSection1__user}>
                <div className={styles.headerSection1__avatar}>
                  {user.fullName.slice(0, 2)}
                </div>
                <p className={styles.headerSection1__name}>
                  {user.fullName || ''}
                </p>
              </div>
            </div>
            <div className={styles.headerSection2}>
              <div className={styles.headerSection2__right}>
                {headerContent}
              </div>
            </div>
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
          <div style={{ position: 'sticky', left: 0, top: 20 }}>
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
    </div>
  );
};

export default DashboardLayout;
