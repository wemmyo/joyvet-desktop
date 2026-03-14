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

export interface CustomerHistoryPaymentsProps {
  data: any[];
}

const CustomerHistoryPayments: React.FC<CustomerHistoryPaymentsProps> = ({
  data,
}: CustomerHistoryPaymentsProps) => {
  const renderPayments = () => {
    const allPayments = data.map((payment) => {
      return (
        <TableRow key={payment.id}>
          <TableCell>{payment.id}</TableCell>
          <TableCell>₦{numberWithCommas(payment.amount)}</TableCell>
          <TableCell>{payment.paymentMethod}</TableCell>
          <TableCell>{payment.bank}</TableCell>
          <TableCell>
            {dayjs(payment.createdAt).format('DD/MM/YY, h:mm a')}
          </TableCell>
          <TableCell>{payment.note}</TableCell>
        </TableRow>
      );
    });
    return allPayments;
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
            <TableHead>Payment ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Date &amp; Time</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderPayments()}</TableBody>
      </Table>
      {isAdmin() ? (
        <div className="mt-2 text-right font-semibold">
          Total: ₦{numberWithCommas(sumOfAmounts())}
        </div>
      ) : null}
    </>
  );
};

export default CustomerHistoryPayments;

// CustomerHistoryReceipts
