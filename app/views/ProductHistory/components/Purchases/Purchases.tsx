import * as React from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';
import { IPurchaseItem } from '../../../../models/purchaseItem';

export interface ProductHistoryPurchasesProps {
  data: IPurchaseItem[];
}

const ProductHistoryPurchases: React.FC<ProductHistoryPurchasesProps> = ({
  data,
}: ProductHistoryPurchasesProps) => {
  const renderPurchases = () => {
    const allPurchases = data.map((invoice) => {
      return (
        <Table.Row key={invoice.id}>
          <Table.Cell>{invoice.purchaseId}</Table.Cell>
          <Table.Cell>{invoice.quantity}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.unitPrice)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.amount)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.sellPrice)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.sellPrice2)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.sellPrice3)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.oldBuyPrice)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.oldSellPrice)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.oldSellPrice2)}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(invoice.oldSellPrice3)}</Table.Cell>
          <Table.Cell>{numberWithCommas(invoice.oldStockLevel)}</Table.Cell>
          <Table.Cell>
            {moment(invoice.createdAt).format('DD/MM/YY, h:mm a')}
          </Table.Cell>
        </Table.Row>
      );
    });
    return allPurchases;
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
          <Table.HeaderCell>Purchase ID</Table.HeaderCell>
          <Table.HeaderCell>Quantity</Table.HeaderCell>
          <Table.HeaderCell>Unit Price</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
          <Table.HeaderCell>Sell Price 1</Table.HeaderCell>
          <Table.HeaderCell>Sell Price 2</Table.HeaderCell>
          <Table.HeaderCell>Sell Price 3</Table.HeaderCell>
          <Table.HeaderCell>Prv. Buy Price</Table.HeaderCell>
          <Table.HeaderCell>Prv. Price 1</Table.HeaderCell>
          <Table.HeaderCell>Prv. Price 2</Table.HeaderCell>
          <Table.HeaderCell>Prv. Price 3</Table.HeaderCell>
          <Table.HeaderCell>Prv. Stock Level</Table.HeaderCell>
          <Table.HeaderCell>Date & Time</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{renderPurchases()}</Table.Body>

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
            <Table.HeaderCell />
            <Table.HeaderCell />
            <Table.HeaderCell />
            <Table.HeaderCell />
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

export default ProductHistoryPurchases;

// ProductHistoryReceipts
