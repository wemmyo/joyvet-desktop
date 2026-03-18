import React from 'react';
import { Button } from '../../components/ui/button';
import {
  SidebarInset,
  SidebarTrigger,
} from '../../components/ui/sidebar';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { getUserSession } from '../../utils/session';
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
  const user = getUserSession();
  const userFullName = user?.fullName ?? '';
  const avatarLabel = userFullName.slice(0, 2).toUpperCase();

  return (
    <SidebarInset>
        <div className={styles.layoutShell}>
          <div className={styles.mainContainer}>
            <header className={styles.header}>
              <div className={styles.headerSection1}>
                <div className={styles.headerSection1__leading}>
                  <SidebarTrigger />
                  <h2 className={styles.headerSection1__title}>{screenTitle}</h2>
                </div>
                <div className={styles.headerSection1__user}>
                  <div className={styles.headerSection1__avatar}>
                    {avatarLabel}
                  </div>
                  <p className={styles.headerSection1__name}>
                    {userFullName}
                  </p>
                </div>
              </div>
              <div className={styles.headerSection2}>{headerContent}</div>
            </header>
            <main className={styles.main}>{children}</main>
          </div>
          <aside
            className={`${styles.rightSidebar} ${
              sideContentisOpen
                ? styles.rightSidebar__open
                : styles.rightSidebar__close
            }`}
          >
            <div className={styles.rightSidebarInner}>
              <div className={styles.rightSidebarClose}>
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
          </aside>
        </div>
      </SidebarInset>
  );
};

export default DashboardLayout;
