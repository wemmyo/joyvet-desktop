import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectPaymentState,
  getPaymentsFn,
  createPaymentFn,
} from '../../slices/paymentSlice';
import CreatePayment from './components/CreatePayment/CreatePayment';
import { numberWithCommas } from '../../utils/helpers';

export interface PaymentsScreenProps {}

const PaymentsScreen: React.FC<PaymentsScreenProps> = () => {
  const dispatch = useDispatch();
  const paymentState = useSelector(selectPaymentState);
  const { data: payment } = paymentState.payment;

  const fetchPayments = () => {
    dispatch(getPaymentsFn());
  };

  useEffect(fetchPayments, []);

  const handleNewPayment = (values: any) => {
    dispatch(
      createPaymentFn(values, () => {
        fetchPayments();
        // console.log('created');
      })
    );
  };

  const renderRows = () => {
    console.log(payment);
    // return <p>yes</p>;
    const rows = payment.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.fullName}</Table.Cell>
          <Table.Cell>{each.address}</Table.Cell>
          <Table.Cell>{each.phoneNumber}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.balance)}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout
      screenTitle="Payments"
      rightSidebar={<CreatePayment createPaymentFn={handleNewPayment} />}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Supplier Name</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
            <Table.HeaderCell>Posted by</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default PaymentsScreen;
