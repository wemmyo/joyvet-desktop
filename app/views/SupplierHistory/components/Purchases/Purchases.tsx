import * as React from 'react';
import dayjs from 'dayjs';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';

export interface CustomerHistoryPurchasesProps {
  data: any[];
}

const CustomerHistoryPurchases: React.FC<CustomerHistoryPurchasesProps> = ({
  data,
}: CustomerHistoryPurchasesProps) => {
  const renderPurchases = () => {
    const allPurchases = data.map((invoice) => {
      return (
        <TableRow key={invoice.id}>
          <TableCell>{invoice.id}</TableCell>
          <TableCell>{invoice.invoiceNumber}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.amount)}</TableCell>
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Purchase ID</TableHead>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date &amp; Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderPurchases()}</TableBody>
      </Table>
      {isAdmin() ? (
        <div className="mt-2 text-right font-semibold">
          Total: ₦{numberWithCommas(sumOfAmounts())}
        </div>
      ) : null}
    </>
  );
};

export default CustomerHistoryPurchases;

// CustomerHistoryReceipts
