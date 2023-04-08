import * as React from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';
import { IInvoiceItem } from '../../../../models/invoiceItem';

export interface ProductHistoryInvoicesProps {
  data: IInvoiceItem[];
}

const ProductHistoryInvoices: React.SFC<ProductHistoryInvoicesProps> = ({
  data,
}: ProductHistoryInvoicesProps) => {
  const renderInvoices = () => {
    const allInvoices = data.map((invoice) => {
      return (
        <Table.Row key={invoice.id}>
          <Table.Cell>{invoice.invoiceId}</Table.Cell>
          <Table.Cell>{invoice.quantity}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.unitPrice)}</Table.Cell>
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
          <Table.HeaderCell>Quantity</Table.HeaderCell>
          <Table.HeaderCell>Unit Price</Table.HeaderCell>
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

export default ProductHistoryInvoices;

// ProductHistoryReceipts
