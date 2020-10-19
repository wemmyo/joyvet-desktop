import * as React from 'react';
import styles from './Sidebar.css';
import { Icon } from 'semantic-ui-react';
// export interface SidebarProps {}

const Sidebar = () => {
  return (
    <section className={styles.sidebar}>
      <h4>Joyvet</h4>
      <IconNavItem title="Get Started" />
      <IconNavItem title="Dashboard" />
      <IconNavWithChildren title="Sales" />
      <IconNavItem title="Purchases" />
      <IconNavItem title="Reports" />
      <IconNavWithChildren title="Setup" />
    </section>
  );
};

export default Sidebar;

const IconNavItem = ({ title }: { title: string }) => {
  return (
    <div
      className={`${styles.sidebar__mainItem} ${styles.sidebar__mainItemActive}`}
    >
      <Icon size="large" name="settings" />
      <p className={styles.sidebar__mainItemText}>{title}</p>
    </div>
  );
};

const IconNavWithChildren = ({ title }: { title: string }) => {
  return (
    <div>
      <IconNavItem title={title} />
      <ul className={styles.sidebar__subItemContainer}>
        <li
          className={`${styles.sidebar__subItem} ${styles.sidebar__subItemActive}`}
        >
          Invoices
        </li>
        <li className={styles.sidebar__subItem}>Customers</li>
        <li className={styles.sidebar__subItem}>Items</li>
      </ul>
    </div>
  );
};
