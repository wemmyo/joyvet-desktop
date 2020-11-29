import * as React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { Icon } from 'semantic-ui-react';
import styles from './SideNav.css';
// import NavItem from './components/NavItem/NavItem';
import routes from '../../../routing/routes';
import { logoutFn } from '../../../slices/userSlice';
// export interface SideNavProps {}

const SideNav = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <section className={styles.sideNav}>
      <h4>Menu</h4>
      {/* <NavItem
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
      /> */}

      {/* <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.OVERVIEW}
      >
        Overview
      </NavLink> */}
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.INVOICE}
      >
        Invoices
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.SALES}
      >
        Sales
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.PRODUCT}
      >
        Products
      </NavLink>

      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.CUSTOMER}
      >
        Customers
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.SUPPLIER}
      >
        Suppliers
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.RECEIPT}
      >
        Receipt
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.PAYMENT}
      >
        Payment
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.PURCHASE}
      >
        Purchase
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.ALL_PURCHASES}
      >
        All Purchases
      </NavLink>
      <NavLink
        activeClassName={styles.sideNav__mainItemActive}
        className={styles.sideNav__mainItem}
        to={routes.USER}
      >
        Users
      </NavLink>

      <div
        // type="div"
        style={{ color: 'red', cursor: 'pointer' }}
        className={styles.sideNav__mainItem}
        onClick={() => {
          dispatch(
            logoutFn(() => {
              history.push(routes.LOGIN);
            })
          );
        }}
      >
        Log out
      </div>
      {/* <IconNavItem title="Get Started" /> */}
      {/* <IconNavWithChildren title="Sales" /> */}
    </section>
  );
};

export default SideNav;

// const IconNavItem = ({ title }: { title: string }) => {
//   return (
//     <div
//       className={`${styles.sideNav__mainItem} ${styles.sideNav__mainItemActive}`}
//     >
//       {/* <Icon size="large" name="settings" /> */}
//       <p className={styles.sideNav__mainItemText}>{title}</p>
//     </div>
//   );
// };

// const IconNavWithChildren = ({ title }: { title: string }) => {
//   return (
//     <div>
//       <IconNavItem title={title} />
//       <ul className={styles.sideNav__subItemContainer}>
//         <li
//           className={`${styles.sideNav__subItem} ${styles.sideNav__subItemActive}`}
//         >
//           Invoices
//         </li>
//         <li className={styles.sideNav__subItem}>Customers</li>
//         <li className={styles.sideNav__subItem}>Items</li>
//       </ul>
//     </div>
//   );
// };
