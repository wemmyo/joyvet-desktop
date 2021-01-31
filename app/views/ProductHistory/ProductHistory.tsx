import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface ProductHistoryProps {}

const ProductHistory: React.SFC<ProductHistoryProps> = () => {
  return (
    <DashboardLayout screenTitle="Product History">
      <h2>Product History</h2>
    </DashboardLayout>
  );
};

export default ProductHistory;
