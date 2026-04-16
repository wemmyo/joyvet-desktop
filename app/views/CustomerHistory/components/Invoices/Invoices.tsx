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
import { isAdmin, numberWithCommas, sum } from '../../../../utils/helpers';

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
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.amount)}
          </TableCell>
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
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Sale Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date &amp; Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              renderInvoices()
            ) : (
              <TableEmptyRow colSpan={4} message="No invoices found." />
            )}
          </TableBody>
          {isAdmin() ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">
                  ₦{numberWithCommas(sumOfAmounts())}
                </TableCell>
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </TableFrame>
    </>
  );
};

export default CustomerHistoryInvoices;

// CustomerHistoryReceipts
