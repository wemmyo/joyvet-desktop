import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Table, Button } from 'semantic-ui-react';
import moment from 'moment';

import { numberWithCommas } from '../../../../utils/helpers';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import {
  getSinglePaymentFn,
  deletePaymentFn,
} from '../../../../controllers/payment.controller';
import { IPayment } from '../../../../models/payment';

export interface PaymentDetailProps {
  paymentId: number;
  refreshPayments: () => void;
}

const PaymentDetail = ({ paymentId, refreshPayments }: PaymentDetailProps) => {
  const [singlePayment, setSinglePayment] = useState<IPayment>({} as IPayment);
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSinglePaymentFn(Number(paymentId));
      setSinglePayment(response);
      setLoading(false);
    };

    fetchData();
  }, [paymentId]);

  const handleDelete = async () => {
    await deletePaymentFn(paymentId);
    refreshPayments();
    dispatch(closeSideContentFn());
  };

  const {
    supplier,
    amount,
    note,
    createdAt,
    paymentMethod,
    bank,
  } = singlePayment;

  if (loading) {
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
              {moment(createdAt).format('DD/MM/YYYY') || ''}
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
