import * as React from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';

export interface CustomerHistoryPaymentsProps {
  data: any[];
}

const CustomerHistoryPayments: React.SFC<CustomerHistoryPaymentsProps> = ({
  data,
}: CustomerHistoryPaymentsProps) => {
  const renderPayments = () => {
    const allPayments = data.map((payment) => {
      return (
        <Table.Row key={payment.id}>
          <Table.Cell>{payment.id}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(payment.amount)}</Table.Cell>
          <Table.Cell>{payment.paymentMethod}</Table.Cell>
          <Table.Cell>{payment.bank}</Table.Cell>
          <Table.Cell>
            {moment(payment.createdAt).format('DD/MM/YY, h:mm a')}
          </Table.Cell>
          <Table.Cell>{payment.note}</Table.Cell>
        </Table.Row>
      );
    });
    return allPayments;
  };

  const sumOfAmounts = () => {
    if (data.length === 0) {
      return 0;
    }
    return data
      .map((item: any) => {
        return item.amount;
      })
      .reduce(sum);
  };

  return (
    <Table singleLine>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Payment ID</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
          <Table.HeaderCell>Payment Method</Table.HeaderCell>
          <Table.HeaderCell>Bank</Table.HeaderCell>
          <Table.HeaderCell>Date & Time</Table.HeaderCell>
          <Table.HeaderCell>Note</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{renderPayments()}</Table.Body>

      {isAdmin() ? (
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell style={{ fontWeight: 'bold' }}>
              Total: ₦{numberWithCommas(sumOfAmounts())}
            </Table.HeaderCell>
            <Table.HeaderCell />
            <Table.HeaderCell />
            <Table.HeaderCell />
            <Table.HeaderCell />
          </Table.Row>
        </Table.Footer>
      ) : null}
    </Table>
  );
};

export default CustomerHistoryPayments;

// CustomerHistoryReceipts
