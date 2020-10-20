import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface ProductScreenProps {}

const ProductScreen: React.SFC<ProductScreenProps> = () => {
  return <DashboardLayout screenTitle="Products">Products</DashboardLayout>;
};

export default ProductScreen;
