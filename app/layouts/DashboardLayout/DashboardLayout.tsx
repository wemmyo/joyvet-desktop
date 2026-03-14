import React from 'react';
import { Button } from '../../components/ui/button';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../../components/ui/sidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import SideNav from './SideNav/SideNav';
import styles from './DashboardLayout.module.css';

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
  const { sideContentisOpen, closeSideContent } = useSidebarContext();

  const user =
    localStorage.getItem('user') !== null
      ? JSON.parse(localStorage.getItem('user') || '')
      : '';

  return (
    <SidebarProvider>
      <SideNav />
      <SidebarInset>
        <div className={styles.mainContainer}>
          <header>
            <div className={styles.headerSection1}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <SidebarTrigger />
                <h2 className={styles.headerSection1__title}>{screenTitle}</h2>
              </div>
              <div className={styles.headerSection1__user}>
                <div className={styles.headerSection1__avatar}>
                  {user.fullName.slice(0, 2)}
                </div>
                <p className={styles.headerSection1__name}>
                  {user.fullName || ''}
                </p>
              </div>
            </div>
            <div className={styles.headerSection2}>{headerContent}</div>
          </header>
          <main className={styles.main}>{children}</main>
        </div>
      </SidebarInset>
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
              variant="outline"
              size="sm"
              onClick={() => {
                closeSideContent();
              }}
            >
              Close
            </Button>
          </div>

          {rightSidebar}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
