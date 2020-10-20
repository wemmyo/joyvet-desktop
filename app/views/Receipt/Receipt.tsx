import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface ReceiptScreenProps {}

const ReceiptScreen: React.SFC<ReceiptScreenProps> = () => {
  return (
    <DashboardLayout screenTitle="Receipt">
      <p>Receipt</p>
    </DashboardLayout>
  );
};

export default ReceiptScreen;
