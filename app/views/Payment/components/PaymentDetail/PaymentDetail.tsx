import React from 'react';
import { Table } from 'semantic-ui-react';

export interface PaymentDetailProps {
  singlePayment: any;
}

const PaymentDetail: React.SFC<PaymentDetailProps> = ({ singlePayment }) => {
  return (
    <Table>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Supplier</Table.Cell>
          <Table.Cell>
            {singlePayment.supplier ? singlePayment.supplier.fullName : ''}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Supplier's balance</Table.Cell>
          <Table.Cell>
            {singlePayment.supplier ? singlePayment.supplier.balance : 0.0}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Amount</Table.Cell>
          <Table.Cell>{singlePayment.amount || ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Note</Table.Cell>
          <Table.Cell>{singlePayment.note || ''}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Date</Table.Cell>
          <Table.Cell>
            {new Date(singlePayment.createdAt).toLocaleDateString('en-gb') ||
              ''}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
};

export default PaymentDetail;
