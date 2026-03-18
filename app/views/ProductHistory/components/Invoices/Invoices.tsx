import * as React from 'react';
import dayjs from 'dayjs';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';
import { IInvoiceItem } from '../../../../models/invoiceItem';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '../../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../../components/ui/table-helpers';

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
          <TableCell className="text-right">{invoice.quantity}</TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(invoice.unitPrice)}
          </TableCell>
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
    <div>
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date &amp; Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              renderInvoices()
            ) : (
              <TableEmptyRow colSpan={5} message="No invoice history found." />
            )}
          </TableBody>
          {isAdmin() ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>Total</TableCell>
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

export default ProductHistoryInvoices;

// ProductHistoryReceipts
