import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button } from 'semantic-ui-react';
import {
  getSinglePaymentFn,
  selectPaymentState,
  deletePaymentFn,
  getPaymentsFn,
} from '../../../../slices/paymentSlice';
import { numberWithCommas } from '../../../../utils/helpers';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';

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

  const handleDelete = () => {
    dispatch(
      deletePaymentFn(paymentId, () => {
        dispatch(getPaymentsFn());
        dispatch(closeSideContentFn());
      })
    );
  };

  const {
    supplier,
    amount,
    note,
    createdAt,
    paymentMethod,
    bank,
  } = singlePayment;

  if (loading || !singlePayment) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Supplier</Table.Cell>
            <Table.Cell>{supplier ? supplier.fullName : ''}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Supplier balance</Table.Cell>
            <Table.Cell>
              {supplier ? numberWithCommas(supplier.balance) : 0.0}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Amount</Table.Cell>
            <Table.Cell>{numberWithCommas(amount) || ''}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Payment Method</Table.Cell>
            <Table.Cell>{paymentMethod || ''}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Bank</Table.Cell>
            <Table.Cell>{bank || ''}</Table.Cell>
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
      <Button onClick={() => handleDelete()} type="Submit" negative>
        Delete
      </Button>
    </>
  );
};

export default PaymentDetail;
