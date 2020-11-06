import React from 'react';
import { Table } from 'semantic-ui-react';

export interface PaymentDetailProps {
  payment: any;
}

const PaymentDetail: React.SFC<PaymentDetailProps> = ({ payment }) => {
  console.log(payment);

  return (
    // <p>Hello world</p>
    <Table>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Supplier</Table.Cell>
          <Table.Cell>{payment.supplier.fullName || ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Supplier's balance</Table.Cell>
          <Table.Cell>{payment.supplier.balance || 0.0}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Amount</Table.Cell>
          <Table.Cell>{payment.amount || ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Note</Table.Cell>
          <Table.Cell>{payment.note || ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Date</Table.Cell>
          <Table.Cell>
            {new Date(payment.createdAt).toLocaleDateString('en-gb') || ''}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
};

export default PaymentDetail;
