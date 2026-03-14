import * as React from 'react';
import dayjs from 'dayjs';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';
import { IInvoiceItem } from '../../../../models/invoiceItem';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../../components/ui/table';

export interface ProductHistoryInvoicesProps {
  data: IInvoiceItem[];
}

const ProductHistoryInvoices: React.FC<ProductHistoryInvoicesProps> = ({
  data,
}: ProductHistoryInvoicesProps) => {
  const renderInvoices = () => {
    const allInvoices = data.map((invoice) => {
      return (
        <TableRow key={invoice.id}>
          <TableCell>{invoice.invoiceId}</TableCell>
          <TableCell>{invoice.quantity}</TableCell>
          <TableCell>₦{numberWithCommas(invoice.unitPrice)}</TableCell>
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date &amp; Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderInvoices()}</TableBody>
      </Table>
      {isAdmin() ? (
        <div className="mt-2 text-sm font-semibold text-right">
          Total: ₦{numberWithCommas(sumOfAmounts())}
        </div>
      ) : null}
    </div>
  );
};

export default ProductHistoryInvoices;

// ProductHistoryReceipts
