import * as React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

export interface InvoiceProps {}

const InvoiceScreen: React.SFC<InvoiceProps> = () => {
  return (
    <DashboardLayout screenTitle="Invoice">
      <p>Invoice</p>
    </DashboardLayout>
  );
};

export default InvoiceScreen;
