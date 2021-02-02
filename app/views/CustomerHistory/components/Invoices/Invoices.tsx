import * as React from 'react';

export interface CustomerHistoryInvoicesProps {
  data: any[];
}

const CustomerHistoryInvoices: React.SFC<CustomerHistoryInvoicesProps> = () => {
  return (
    <div>
      <p>Invoices</p>
    </div>
  );
};

export default CustomerHistoryInvoices;
