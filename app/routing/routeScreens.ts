import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

import routes from './routes';

type RouteModule = { default: ComponentType<any> };
type RouteLoader = () => Promise<RouteModule>;
type PreloadableLazyComponent = LazyExoticComponent<ComponentType<any>> & {
  preload: RouteLoader;
};

const createRouteScreen = (loader: RouteLoader) => {
  const Screen = lazy(loader) as PreloadableLazyComponent;
  Screen.preload = loader;
  return Screen;
};

export const LoginScreen = createRouteScreen(
  () => import('../views/Login/Login')
);
export const CustomersScreen = createRouteScreen(
  () => import('../views/Customer/Customer')
);
export const InvoiceScreen = createRouteScreen(
  () => import('../views/Invoice/Invoice')
);
export const ProductScreen = createRouteScreen(
  () => import('../views/Product/Product')
);
export const SupplierScreen = createRouteScreen(
  () => import('../views/Supplier/Supplier')
);
export const ReceiptScreen = createRouteScreen(
  () => import('../views/Receipt/Receipt')
);
export const PaymentScreen = createRouteScreen(
  () => import('../views/Payment/Payment')
);
export const PurchaseScreen = createRouteScreen(
  () => import('../views/Purchase/Purchase')
);
export const AllPurchasesScreen = createRouteScreen(
  () => import('../views/AllPurchases/AllPurchases')
);
export const SalesScreen = createRouteScreen(
  () => import('../views/Sales/Sales')
);
export const UserScreen = createRouteScreen(() => import('../views/User/User'));
export const ExpenseScreen = createRouteScreen(
  () => import('../views/Expense/Expense')
);
export const EditInvoiceScreen = createRouteScreen(
  () => import('../views/Invoice/components/EditInvoice')
);
export const CustomerHistory = createRouteScreen(
  () => import('../views/CustomerHistory/CustomerHistory')
);
export const SupplierHistory = createRouteScreen(
  () => import('../views/SupplierHistory/SupplierHistory')
);
export const ProductHistory = createRouteScreen(
  () => import('../views/ProductHistory/ProductHistory')
);
export const StoreInfoScreen = createRouteScreen(
  () => import('../views/StoreInfo/StoreInfo')
);
export const AnalyticsScreen = createRouteScreen(
  () => import('../views/Analytics/Analytics')
);
export const BackupScreen = createRouteScreen(
  () => import('../views/Backup/Backup')
);

const routePreloaders: Record<string, RouteLoader> = {
  [routes.LOGIN]: LoginScreen.preload,
  [routes.CUSTOMER]: CustomersScreen.preload,
  [routes.INVOICE]: InvoiceScreen.preload,
  [routes.PRODUCT]: ProductScreen.preload,
  [routes.SUPPLIER]: SupplierScreen.preload,
  [routes.RECEIPT]: ReceiptScreen.preload,
  [routes.PAYMENT]: PaymentScreen.preload,
  [routes.PURCHASE]: PurchaseScreen.preload,
  [routes.ALL_PURCHASES]: AllPurchasesScreen.preload,
  [routes.SALES]: SalesScreen.preload,
  [routes.USER]: UserScreen.preload,
  [routes.EXPENSE]: ExpenseScreen.preload,
  [routes.STORE_INFO]: StoreInfoScreen.preload,
  [routes.ANALYTICS]: AnalyticsScreen.preload,
  [routes.BACKUP]: BackupScreen.preload,
};

export const preloadRoute = (route: string) => {
  const preload = routePreloaders[route];

  if (!preload) {
    return Promise.resolve();
  }

  return preload().then(() => undefined);
};

export const preloadRoutes = (routeList: string[]) => {
  return Promise.allSettled(routeList.map((route) => preloadRoute(route)));
};
