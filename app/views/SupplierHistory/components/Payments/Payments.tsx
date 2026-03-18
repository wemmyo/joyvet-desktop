import * as React from 'react';
import dayjs from 'dayjs';
import { numberWithCommas, isAdmin, sum } from '../../../../utils/helpers';
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
          <TableCell className="text-right">
            ₦{numberWithCommas(payment.amount)}
          </TableCell>
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
      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              renderPayments()
            ) : (
              <TableEmptyRow colSpan={6} message="No payments found." />
            )}
          </TableBody>
          {isAdmin() ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>Total</TableCell>
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

export default CustomerHistoryPayments;

// CustomerHistoryReceipts
