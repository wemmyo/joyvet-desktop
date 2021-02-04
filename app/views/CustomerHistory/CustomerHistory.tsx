import React, { useEffect } from 'react';
import { Tab } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  getCustomerInvoicesFn,
  getCustomerReceiptsFn,
  selectCustomerState,
} from '../../slices/customerSlice';
import CustomerHistoryInvoices from './components/Invoices/Invoices';
import CustomerHistoryReceipts from './components/Receipts/Receipts';

// export interface CustomerHistoryProps {}

const CustomerHistory: React.SFC = ({ match }: any) => {
  const customerId = match.params.id;

  const dispatch = useDispatch();
  const customerState = useSelector(selectCustomerState);

  const { data: receiptsRaw } = customerState.receipts;
  const { data: invoicesRaw } = customerState.invoices;

  const receipts = receiptsRaw ? JSON.parse(receiptsRaw) : [];
  const invoices = invoicesRaw ? JSON.parse(invoicesRaw) : [];

  useEffect(() => {
    dispatch(getCustomerInvoicesFn(customerId));
    dispatch(getCustomerReceiptsFn(customerId));
  }, []);

  const panes = [
    // {
    //   menuItem: 'All',
    //   render: function AllTab() {
    //     return <Tab.Pane>Tab 1 Content</Tab.Pane>;
    //   },
    // },
    {
      menuItem: 'Receipts',
      render: function ReceiptsTab() {
        return (
          <Tab.Pane>
            <CustomerHistoryReceipts data={receipts} />
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: 'Invoices',
      render: function InvoicesTab() {
        return (
          <Tab.Pane>
            <CustomerHistoryInvoices data={invoices} />
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
