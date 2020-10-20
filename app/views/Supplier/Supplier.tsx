import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface SupplierScreenProps {}

const SupplierScreen: React.SFC<SupplierScreenProps> = () => {
  return (
    <DashboardLayout screenTitle="Supplier">
      <p>Supplier</p>
    </DashboardLayout>
  );
};

export default SupplierScreen;
