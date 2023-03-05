import React, { useEffect, useState } from 'react';
import { Form, Button, Tab } from 'semantic-ui-react';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  getSupplierPaymentsFn,
  getSupplierPurchasesFn,
  selectSupplierState,
} from '../../slices/supplierSlice';
import SuppplierHistoryPayments from './components/Payments/Payments';
import SuppplierHistoryPurchases from './components/Purchases/Purchases';

// export interface SuppplierHistoryProps {}

const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;

const SuppplierHistory: React.SFC = ({ match }: any) => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);

  const supplierId = match.params.id;

  const dispatch = useDispatch();
  const supplierState = useSelector(selectSupplierState);

  const { data: payments } = supplierState.payments;
  const { data: purchases } = supplierState.purchases;

  useEffect(() => {
    dispatch(getSupplierPaymentsFn(supplierId, startDate, endDate));
    dispatch(getSupplierPurchasesFn(supplierId, startDate, endDate));
  }, [startDate, endDate, supplierId, dispatch]);

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
            <SuppplierHistoryPurchases data={purchases} />
          </Tab.Pane>
        );
      },
    },
    {
      menuItem: 'Payments',
      render: function PaymentsTab() {
        return (
          <Tab.Pane>
            <SuppplierHistoryPayments data={payments} />
          </Tab.Pane>
        );
      },
    },
  ];

  return (
    <DashboardLayout screenTitle="Supplier History">
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

export default withRouter(SuppplierHistory);
