import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface PurchaseScreenProps {}

const PurchaseScreen: React.SFC<PurchaseScreenProps> = () => {
  return (
    <DashboardLayout screenTitle="Purchase">
      <p>Purchases</p>
    </DashboardLayout>
  );
};

export default PurchaseScreen;
