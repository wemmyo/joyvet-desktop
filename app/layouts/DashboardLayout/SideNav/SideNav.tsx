import * as React from 'react';
// import { Icon } from 'semantic-ui-react';
import styles from './SideNav.css';
import NavItem from './components/NavItem/NavItem';
import { Link } from 'react-router-dom';
import routes from '../../../constants/routes';
// export interface SidebarProps {}

const Sidebar = () => {
  return (
    <section className={styles.sidebar}>
      <h4>Menu</h4>
      <NavItem
        title="Customer Enquiry"
        link="/overview"
        links={[
          {
            title: 'Debtors list',
            link: '/overview',
          },
          {
            title: 'Customer history',
            link: routes.CUSTOMERS,
          },
          {
            title: 'Customer balance entry',
            link: '/overview',
          },
        ]}
      />
      <NavItem
        title="Stock Enquiry"
        link="/overview"
        links={[
          {
            title: 'Stock balance',
            link: '/overview',
          },
          {
            title: 'Stock movement history',
            link: '/overview',
          },
        ]}
      />
      <NavItem
        title="Supplier Enquiry"
        link="/overview"
        links={[
          {
            title: 'Supplier account balance',
            link: '/overview',
          },
          {
            title: 'Supplier account history',
            link: '/overview',
          },
        ]}
      />
      <NavItem
        title="Daily Transaction"
        link="/overview"
        links={[
          {
            title: 'POS Sales',
            link: '/overview',
          },
          {
            title: 'Sales Transaction',
            link: '/overview',
          },
          {
            title: 'Receipt',
            link: '/overview',
          },
          {
            title: 'Purchases',
            link: '/overview',
          },
          {
            title: 'Payment',
            link: '/overview',
          },
        ]}
      />
      <NavItem
        title="Stock"
        link="/overview"
        links={[
          {
            title: 'Stock taking',
            link: '/overview',
          },
        ]}
      />
      <NavItem
        title="Report"
        link="/overview"
        links={[
          {
            title: 'Stock list',
            link: '/overview',
          },
          {
            title: 'Reorder list',
            link: '/overview',
          },
          {
            title: 'Customer list',
            link: '/overview',
          },
        ]}
      />
      <div>
        <Link to={routes.CUSTOMERS}>Customers</Link>
      </div>

      <Link to="/">Log out</Link>
      {/* <IconNavItem title="Get Started" /> */}
      {/* <IconNavWithChildren title="Sales" /> */}
    </section>
  );
};

export default Sidebar;

// const IconNavItem = ({ title }: { title: string }) => {
//   return (
//     <div
//       className={`${styles.sidebar__mainItem} ${styles.sidebar__mainItemActive}`}
//     >
//       {/* <Icon size="large" name="settings" /> */}
//       <p className={styles.sidebar__mainItemText}>{title}</p>
//     </div>
//   );
// };

// const IconNavWithChildren = ({ title }: { title: string }) => {
//   return (
//     <div>
//       <IconNavItem title={title} />
//       <ul className={styles.sidebar__subItemContainer}>
//         <li
//           className={`${styles.sidebar__subItem} ${styles.sidebar__subItemActive}`}
//         >
//           Invoices
//         </li>
//         <li className={styles.sidebar__subItem}>Customers</li>
//         <li className={styles.sidebar__subItem}>Items</li>
//       </ul>
//     </div>
//   );
// };
