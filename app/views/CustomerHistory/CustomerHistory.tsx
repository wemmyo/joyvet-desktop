import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, Tab } from 'semantic-ui-react';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CustomerHistoryInvoices from './components/Invoices/Invoices';
import CustomerHistoryReceipts from './components/Receipts/Receipts';
import {
  getCustomerInvoicesFn,
  getCustomerReceiptsFn,
} from '../../controllers/customer.controller';

const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;

const CustomerHistory: React.FC = ({ match }: any) => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [receipts, setReceipts] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const customerId = match.params.id;

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    const fetchData = async () => {
      const getInvoices = getCustomerInvoicesFn(customerId, startDate, endDate);
      const getReceipts = getCustomerReceiptsFn(customerId, startDate, endDate);

      const [invoicesResponse, receiptsResponse] = await Promise.all([
        getInvoices,
        getReceipts,
      ]);
      setInvoices(invoicesResponse);
      setReceipts(receiptsResponse);
    };

    fetchData();
  }, [startDate, endDate, customerId]);

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
