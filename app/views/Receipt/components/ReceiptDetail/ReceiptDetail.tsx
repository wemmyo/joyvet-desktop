import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table } from 'semantic-ui-react';
import {
  getSingleReceiptFn,
  selectReceiptState,
} from '../../../../slices/receiptSlice';

export interface ReceiptDetailProps {
  receiptId: string | number;
}

const ReceiptDetail: React.SFC<ReceiptDetailProps> = ({ receiptId }) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleReceiptFn(receiptId));
  };

  useEffect(fetchData, [receiptId]);

  const receiptState = useSelector(selectReceiptState);

  const { data: singleReceiptRaw, loading } = receiptState.singleReceipt;

  const singleReceipt = singleReceiptRaw ? JSON.parse(singleReceiptRaw) : {};

  const { customer, amount, note, createdAt } = singleReceipt;

  if (loading || !singleReceipt) {
    return <p>Loading...</p>;
  }

  return (
    <Table>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Customer</Table.Cell>
          <Table.Cell>{customer ? customer.fullName : ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Customer's balance</Table.Cell>
          <Table.Cell>{customer ? customer.balance : 0.0}</Table.Cell>
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

export default ReceiptDetail;
