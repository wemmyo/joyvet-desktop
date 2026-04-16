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
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.amount)}
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
    <>
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purchase ID</TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date &amp; Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              renderPurchases()
            ) : (
              <TableEmptyRow colSpan={4} message="No purchases found." />
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

export default CustomerHistoryPurchases;

// CustomerHistoryReceipts
