import React, { useEffect, useState } from 'react';
import { Form, Button, Tab } from 'semantic-ui-react';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  getProductInvoicesFn,
  getProductPurchasesFn,
  selectProductState,
} from '../../slices/productSlice';
import ProductHistoryInvoices from './components/Invoices/Invoices';
import ProductHistoryPurchases from './components/Purchases/Purchases';

// export interface ProductHistoryProps {}

const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;

const ProductHistory: React.SFC = ({ match }: any) => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);

  const productId = match.params.id;

  const dispatch = useDispatch();
  const productState = useSelector(selectProductState);

  const { data: invoices } = productState.invoices;
  const { data: purchases } = productState.purchases;

  useEffect(() => {
    dispatch(getProductInvoicesFn(productId, startDate, endDate));
    dispatch(getProductPurchasesFn(productId, startDate, endDate));
  }, [startDate, endDate, productId, dispatch]);

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

export default withRouter(ProductHistory);
