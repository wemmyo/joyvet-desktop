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

export interface CustomerHistoryInvoicesProps {
  data: any[];
}

const CustomerHistoryInvoices: React.FC<CustomerHistoryInvoicesProps> = ({
  data,
}: CustomerHistoryInvoicesProps) => {
  const renderInvoices = () => {
    const allInvoices = data.map((invoice) => {
      return (
        <TableRow key={invoice.id}>
          <TableCell>{invoice.id}</TableCell>
          <TableCell>{invoice.saleType}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.amount)}</TableCell>
          <TableCell>
            {dayjs(invoice.createdAt).format('DD/MM/YY, h:mm a')}
          </TableCell>
        </TableRow>
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Sale Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date &amp; Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderInvoices()}</TableBody>
      </Table>
      {isAdmin() ? (
        <div className="mt-2 text-right font-semibold">
          Total: ₦{numberWithCommas(sumOfAmounts())}
        </div>
      ) : null}
    </>
  );
};

export default CustomerHistoryInvoices;

// CustomerHistoryReceipts
