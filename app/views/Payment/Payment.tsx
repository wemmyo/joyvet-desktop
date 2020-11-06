import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectPaymentState,
  getPaymentsFn,
  getSinglePaymentFn,
} from '../../slices/paymentSlice';
import CreatePayment from './components/CreatePayment/CreatePayment';
import { numberWithCommas } from '../../utils/helpers';
import PaymentDetail from './components/PaymentDetail/PaymentDetail';
import { openSideContentFn } from '../../slices/dashboardSlice';

export interface PaymentsScreenProps {}

const PaymentsScreen: React.FC<PaymentsScreenProps> = () => {
  const [sideContent, setSideContent] = useState('');

  const dispatch = useDispatch();
  const paymentState = useSelector(selectPaymentState);
  const { data: payments } = paymentState.payments;
  const { data: payment } = paymentState.singlePayment;
  console.log(payment);

  // console.log(singlePayment);

  // console.log(payment);
  // console.log(JSON.parse(payment));

  // const payment = {};

  const fetchPayments = () => {
    dispatch(getPaymentsFn());
  };

  useEffect(fetchPayments, []);

  const openSinglePayment = (id: number | string) => {
    dispatch(
      getSinglePaymentFn(id, () => {
        openSideContent('detail');
      })
    );
  };

  const renderRows = () => {
    const rows = payments.map((each: any) => {
      return (
        <Table.Row key={each.id} onClick={() => openSinglePayment(each.id)}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
          <Table.Cell>{each.note}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === 'detail') {
      // return <p>Hello</p>;
      return <PaymentDetail payment={JSON.parse(payment)} />;
    } else if (sideContent === 'create') {
      return <CreatePayment />;
    } else {
      return null;
    }
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  return (
    <DashboardLayout screenTitle="Payments" rightSidebar={renderSideContent()}>
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Payment no</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default PaymentsScreen;
