import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectPaymentState,
  getPaymentsFn,
  getSinglePaymentFn,
} from '../../slices/paymentSlice';
import CreatePayment from './components/CreatePayment/CreatePayment';
import { numberWithCommas } from '../../utils/helpers';
import PaymentDetail from './components/PaymentDetail/PaymentDetail';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditPayment from './components/EditPayment/EditPayment';

const CONTENT_CREATE = 'create';
const CONTENT_DETAIL = 'detail';
const CONTENT_EDIT = 'edit';

const PaymentsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [paymentId, setPaymentId] = useState('');

  const dispatch = useDispatch();
  const paymentState = useSelector(selectPaymentState);

  const { data: paymentsRaw } = paymentState.payments;

  const payments = paymentsRaw ? JSON.parse(paymentsRaw) : [];

  const fetchPayments = () => {
    dispatch(getPaymentsFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setPaymentId('');
  };

  useEffect(() => {
    fetchPayments();

    return () => {
      closeSideContent();
    };
  }, []);

  const viewPaymentReceipt = (id: any) => {
    setPaymentId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const editPaymentReceipt = (id: any) => {
    setPaymentId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = payments.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
          <Table.Cell>{each.note}</Table.Cell>
          <Table.Cell
            style={{ cursor: 'pointer' }}
            onClick={() => viewPaymentReceipt(each.id)}
          >
            View
          </Table.Cell>
          <Table.Cell
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={() => editPaymentReceipt(each.id)}
          >
            Edit
          </Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return <PaymentDetail paymentId={paymentId} />;
    } else if (sideContent === CONTENT_CREATE) {
      return <CreatePayment />;
    } else if (sideContent === CONTENT_EDIT) {
      return <EditPayment paymentId={paymentId} />;
    }
    return null;
  };

  const headerContent = () => {
    return (
      <>
        <Button icon labelPosition="left">
          <Icon name="filter" />
          Filter
        </Button>
        <Button
          color="blue"
          icon
          labelPosition="left"
          onClick={() => {
            openSideContent(CONTENT_CREATE);
          }}
        >
          <Icon inverted color="grey" name="add" />
          Create
        </Button>

        <Input icon="search" placeholder="Search..." />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Payments"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Payment no</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
            <Table.HeaderCell />
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default PaymentsScreen;
