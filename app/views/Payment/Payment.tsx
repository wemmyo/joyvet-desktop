import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface PaymentProps {}

const PaymentScreen: React.SFC<PaymentProps> = () => {
  return (
    <DashboardLayout screenTitle="Payment">
      <p>Payment</p>
    </DashboardLayout>
  );
};

export default PaymentScreen;
