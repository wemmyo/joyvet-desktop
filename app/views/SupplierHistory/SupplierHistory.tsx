import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface SupplierHistoryProps {}

const SupplierHistory: React.SFC<SupplierHistoryProps> = () => {
  return (
    <DashboardLayout screenTitle="Supplier History">
      <h2>Supplier History</h2>
    </DashboardLayout>
  );
};

export default SupplierHistory;
