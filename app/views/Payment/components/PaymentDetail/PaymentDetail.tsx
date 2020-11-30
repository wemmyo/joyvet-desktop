import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table } from 'semantic-ui-react';
import {
  getSinglePaymentFn,
  selectPaymentState,
} from '../../../../slices/paymentSlice';

export interface PaymentDetailProps {
  paymentId: string | number;
}

const PaymentDetail: React.SFC<PaymentDetailProps> = ({
  paymentId,
}: PaymentDetailProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSinglePaymentFn(paymentId));
  };

  useEffect(fetchData, [paymentId]);

  const paymentState = useSelector(selectPaymentState);

  const { data: singlePaymentRaw, loading } = paymentState.singlePayment;

  const singlePayment = singlePaymentRaw ? JSON.parse(singlePaymentRaw) : {};

  const { supplier, amount, note, createdAt } = singlePayment;

  if (loading || !singlePayment) {
    return <p>Loading...</p>;
  }

  return (
    <Table>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Supplier</Table.Cell>
          <Table.Cell>{supplier ? supplier.fullName : ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Supplier balance</Table.Cell>
          <Table.Cell>{supplier ? supplier.balance : 0.0}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Amount</Table.Cell>
          <Table.Cell>{amount || ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Note</Table.Cell>
          <Table.Cell>{note || ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Date</Table.Cell>
          <Table.Cell>
            {new Date(createdAt).toLocaleDateString('en-gb') || ''}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
};

export default PaymentDetail;
