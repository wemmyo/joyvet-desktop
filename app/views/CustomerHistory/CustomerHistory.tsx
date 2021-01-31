import React, { useEffect } from 'react';
import { Tab } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  getCustomerInvoicesFn,
  getCustomerReceiptsFn,
} from '../../slices/customerSlice';
import CustomerHistoryInvoices from './components/Invoices/Invoices';
import CustomerHistoryReceipts from './components/Receipts/Receipts';

// export interface CustomerHistoryProps {}

const CustomerHistory: React.SFC = ({ match }: any) => {
  const dispatch = useDispatch();
  const customerId = match.params.id;

  useEffect(() => {
    dispatch(getCustomerInvoicesFn(customerId));
    dispatch(getCustomerReceiptsFn(customerId));
  });

  const panes = [
    {
      menuItem: 'All',
      render: function AllTab() {
        return <Tab.Pane>Tab 1 Content</Tab.Pane>;
      },
    },
    {
      menuItem: 'Receipts',
      render: function ReceiptsTab() {
        return (
          <Tab.Pane>
            <CustomerHistoryReceipts />
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: 'Invoices',
      render: function InvoicesTab() {
        return (
          <Tab.Pane>
            <CustomerHistoryInvoices />
          </Tab.Pane>
        );
      },
    },
  ];

  return (
    <DashboardLayout screenTitle="Customer History">
      <Tab panes={panes} />
    </DashboardLayout>
  );
};

export default withRouter(CustomerHistory);
