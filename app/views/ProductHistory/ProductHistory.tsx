import React, { useEffect, useState } from 'react';
import { Form, Button, Tab } from 'semantic-ui-react';
import moment from 'moment';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import ProductHistoryInvoices from './components/Invoices/Invoices';
import ProductHistoryPurchases from './components/Purchases/Purchases';
import {
  getProductInvoicesFn,
  getProductPurchasesFn,
} from '../../controllers/product.controller';

// export interface ProductHistoryProps {}

const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;

const ProductHistory: React.FC = ({ match }: any) => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);

  const productId = match.params.id;

  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const getInvoices = getProductInvoicesFn(productId, startDate, endDate);
      const getReceipts = getProductPurchasesFn(productId, startDate, endDate);

      const [invoicesResponse, receiptsResponse] = await Promise.all([
        getInvoices,
        getReceipts,
      ]);
      setInvoices(invoicesResponse);
      setPurchases(receiptsResponse);
    };
    fetchData();
  }, [startDate, endDate, productId]);

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
      menuItem: 'Purchases',
      render: function PurchasesTab() {
        return (
          <Tab.Pane>
            <ProductHistoryPurchases data={purchases} />
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: 'Invoices',
      render: function InvoicesTab() {
        return (
          <Tab.Pane>
            <ProductHistoryInvoices data={invoices} />
          </Tab.Pane>
        );
      },
    },
  ];

  return (
    <DashboardLayout screenTitle="Product History">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
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
    </DashboardLayout>
  );
};

export default ProductHistory;
