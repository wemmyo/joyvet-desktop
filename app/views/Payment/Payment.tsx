import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectPaymentState,
  getPaymentsFn,
  searchPaymentFn,
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
  const [searchValue, setSearchValue] = useState('');

  const dispatch = useDispatch();
  const paymentState = useSelector(selectPaymentState);

  const { data: payments, loading: paymentsLoading } = paymentState.payments;

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

  // const editPaymentReceipt = (id: any) => {
  //   setPaymentId(id);
  //   openSideContent(CONTENT_EDIT);
  // };

  const renderRows = () => {
    const rows = payments.map((each: any) => {
      return (
        <Table.Row key={each.id} onClick={() => viewPaymentReceipt(each.id)}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>{each.paymentMethod}</Table.Cell>
          <Table.Cell>{each.bank}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return <PaymentDetail paymentId={paymentId} />;
    }
    if (sideContent === CONTENT_CREATE) {
      return <CreatePayment />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditPayment paymentId={paymentId} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
    if (value.length > 0) {
      dispatch(searchPaymentFn(value));
    } else {
      fetchPayments();
    }
  };

  const headerContent = () => {
    return (
      <>
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
        <Form.Input
          placeholder="Search Payment"
          onChange={handleSearchChange}
          value={searchValue}
        />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Payments"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {paymentsLoading ? (
        <Loader active inline="centered" />
      ) : (
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Payment no</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Payment Method</Table.HeaderCell>
              <Table.HeaderCell>Bank</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{renderRows()}</Table.Body>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default PaymentsScreen;
