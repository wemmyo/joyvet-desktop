import * as React from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';

export interface CustomerHistoryInvoicesProps {
  data: any[];
}

const CustomerHistoryInvoices: React.SFC<CustomerHistoryInvoicesProps> = ({
  data,
}: CustomerHistoryInvoicesProps) => {
  const renderInvoices = () => {
    const allInvoices = data.map((invoice) => {
      return (
        <Table.Row key={invoice.id}>
          <Table.Cell>{invoice.id}</Table.Cell>
          <Table.Cell>{invoice.saleType}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.amount)}</Table.Cell>
          <Table.Cell>
            {moment(invoice.createdAt).format('DD/MM/YY, h:mm a')}
          </Table.Cell>
        </Table.Row>
      );
    });
    return allInvoices;
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
          <Table.HeaderCell>Invoice ID</Table.HeaderCell>
          <Table.HeaderCell>Sale Type</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
          <Table.HeaderCell>Date & Time</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{renderInvoices()}</Table.Body>

      {isAdmin() ? (
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell />
            <Table.HeaderCell style={{ fontWeight: 'bold' }}>
              Total: ₦{numberWithCommas(sumOfAmounts())}
            </Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Footer>
      ) : null}
    </Table>
  );
};

export default CustomerHistoryInvoices;

// CustomerHistoryReceipts
