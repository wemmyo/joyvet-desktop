import React, { useEffect, useState } from 'react';
import { Form, Button, Tab } from 'semantic-ui-react';
import moment from 'moment';
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

const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;

const CustomerHistory: React.SFC = ({ match }: any) => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);

  const customerId = match.params.id;

  const dispatch = useDispatch();
  const customerState = useSelector(selectCustomerState);

  const { data: receiptsRaw } = customerState.receipts;
  const { data: invoicesRaw } = customerState.invoices;

  const receipts = receiptsRaw ? JSON.parse(receiptsRaw) : [];
  const invoices = invoicesRaw ? JSON.parse(invoicesRaw) : [];

  useEffect(() => {
    dispatch(getCustomerInvoicesFn(customerId, startDate, endDate));
    dispatch(getCustomerReceiptsFn(customerId, startDate, endDate));
  }, [startDate, endDate]);

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Form>
          <Form.Group
          // widths="equal"
          >
            <Form.Input
              label="Start Date"
              type="date"
              onChange={(e, { value }) => setStartDate(value)}
              value={startDate}
            />
            <Form.Input
              label="End Date"
              type="date"
              onChange={(e, { value }) => setEndDate(value)}
              value={endDate}
            />
          </Form.Group>
        </Form>
        <Button style={{ marginLeft: 10 }} onClick={resetFilters}>
          Reset
        </Button>
      </div>
      <Tab panes={panes} />
    </DashboardLayout>
  );
};

export default withRouter(CustomerHistory);
