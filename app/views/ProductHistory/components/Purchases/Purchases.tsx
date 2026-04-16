import dayjs from 'dayjs';
import type * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../../components/ui/table-helpers';
import type { IPurchaseItem } from '../../../../models/purchaseItem';
import { isAdmin, numberWithCommas, sum } from '../../../../utils/helpers';

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
          <TableCell className="text-right">{invoice.quantity}</TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.unitPrice)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.amount)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.sellPrice)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.sellPrice2)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.sellPrice3)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.oldBuyPrice)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.oldSellPrice)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.oldSellPrice2)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.oldSellPrice3)}
          </TableCell>
          <TableCell className="text-right">
            {numberWithCommas(invoice.oldStockLevel)}
          </TableCell>
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
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase ID</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Sell Price 1</TableHead>
              <TableHead className="text-right">Sell Price 2</TableHead>
              <TableHead className="text-right">Sell Price 3</TableHead>
              <TableHead className="text-right">Prv. Buy Price</TableHead>
              <TableHead className="text-right">Prv. Price 1</TableHead>
              <TableHead className="text-right">Prv. Price 2</TableHead>
              <TableHead className="text-right">Prv. Price 3</TableHead>
              <TableHead className="text-right">Prv. Stock Level</TableHead>
              <TableHead>Date &amp; Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              renderPurchases()
            ) : (
              <TableEmptyRow
                colSpan={13}
                message="No purchase history found."
              />
            )}
          </TableBody>
          {isAdmin() ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={12}>Total</TableCell>
                <TableCell className="text-right">
                  ₦{numberWithCommas(sumOfAmounts())}
                </TableCell>
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </TableFrame>
    </div>
  );
};

export default ProductHistoryPurchases;

// ProductHistoryReceipts
