import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, Tab } from 'semantic-ui-react';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  getCustomerInvoicesFn,
  getCustomerReceiptsFn,
  selectCustomerState,
} from '../../slices/customerSlice';
import CustomerHistoryInvoices from './components/Invoices/Invoices';
import CustomerHistoryReceipts from './components/Receipts/Receipts';

const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;

const CustomerHistory: React.FC = ({ match }: any) => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);

  const customerId = match.params.id;

  const dispatch = useDispatch();
  const customerState = useSelector(selectCustomerState);

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { data: receipts } = customerState.receipts;
  const { data: invoices } = customerState.invoices;

  useEffect(() => {
    dispatch(getCustomerInvoicesFn(customerId, startDate, endDate));
    dispatch(getCustomerReceiptsFn(customerId, startDate, endDate));
  }, [startDate, endDate, customerId, dispatch]);

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };

  const panes = [
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
      <div ref={componentRef}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Button onClick={handlePrint} icon="print" />
          <Form>
            <Form.Group>
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
      </div>
    </DashboardLayout>
  );
};

export default CustomerHistory;
