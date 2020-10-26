import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectPaymentState, getPaymentsFn } from '../../slices/paymentSlice';
import CreatePayment from './components/CreatePayment/CreatePayment';
import { numberWithCommas } from '../../utils/helpers';

export interface PaymentsScreenProps {}

const PaymentsScreen: React.FC<PaymentsScreenProps> = () => {
  const dispatch = useDispatch();
  const paymentState = useSelector(selectPaymentState);
  const { data: payments } = paymentState.payments;

  const fetchPayments = () => {
    dispatch(getPaymentsFn());
  };

  useEffect(fetchPayments, []);

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
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout screenTitle="Payments" rightSidebar={<CreatePayment />}>
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Payment no</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body> {renderRows()} </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default PaymentsScreen;
