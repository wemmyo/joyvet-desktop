import * as React from 'react';
import dayjs from 'dayjs';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';
import { IPurchaseItem } from '../../../../models/purchaseItem';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../../components/ui/table';

export interface ProductHistoryPurchasesProps {
  data: IPurchaseItem[];
}

const ProductHistoryPurchases: React.FC<ProductHistoryPurchasesProps> = ({
  data,
}: ProductHistoryPurchasesProps) => {
  const renderPurchases = () => {
    const allPurchases = data.map((invoice) => {
      return (
        <TableRow key={invoice.id}>
          <TableCell>{invoice.purchaseId}</TableCell>
          <TableCell>{invoice.quantity}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.unitPrice)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.amount)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.sellPrice)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.sellPrice2)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.sellPrice3)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.oldBuyPrice)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.oldSellPrice)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.oldSellPrice2)}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.oldSellPrice3)}</TableCell>
          <TableCell>{numberWithCommas(invoice.oldStockLevel)}</TableCell>
          <TableCell>
            {dayjs(invoice.createdAt).format('DD/MM/YY, h:mm a')}
          </TableCell>
        </TableRow>
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Purchase ID</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Sell Price 1</TableHead>
            <TableHead>Sell Price 2</TableHead>
            <TableHead>Sell Price 3</TableHead>
            <TableHead>Prv. Buy Price</TableHead>
            <TableHead>Prv. Price 1</TableHead>
            <TableHead>Prv. Price 2</TableHead>
            <TableHead>Prv. Price 3</TableHead>
            <TableHead>Prv. Stock Level</TableHead>
            <TableHead>Date &amp; Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderPurchases()}</TableBody>
      </Table>
      {isAdmin() ? (
        <div className="mt-2 text-sm font-semibold text-right">
          Total: ₦{numberWithCommas(sumOfAmounts())}
        </div>
      ) : null}
    </div>
  );
};

export default ProductHistoryPurchases;

// ProductHistoryReceipts
