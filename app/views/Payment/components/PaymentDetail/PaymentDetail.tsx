import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { numberWithCommas } from '../../../../utils/helpers';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  getSinglePaymentFn,
  deletePaymentFn,
} from '../../../../controllers/payment.controller';
import { IPayment } from '../../../../models/payment';
import { Button } from '../../../../components/ui/button';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '../../../../components/ui/table';

export interface PaymentDetailProps {
  paymentId: number;
  refreshPayments: () => void;
}

const PaymentDetail = ({ paymentId, refreshPayments }: PaymentDetailProps) => {
  const [singlePayment, setSinglePayment] = useState<IPayment>({} as IPayment);
  const [loading, setLoading] = useState<boolean>(true);
  const { closeSideContent } = useSidebarContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSinglePaymentFn(Number(paymentId));
      setSinglePayment(response);
      setLoading(false);
    };

    fetchData();
  }, [paymentId]);

  const handleDelete = async () => {
    await deletePaymentFn(paymentId);
    refreshPayments();
    closeSideContent();
  };

  const { supplier, amount, note, createdAt, paymentMethod, bank } =
    singlePayment;

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Supplier</TableCell>
            <TableCell>{supplier ? supplier.fullName : ''}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Supplier balance</TableCell>
            <TableCell>
              {supplier ? numberWithCommas(supplier.balance) : 0.0}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Amount</TableCell>
            <TableCell>{numberWithCommas(amount) || ''}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Payment Method</TableCell>
            <TableCell>{paymentMethod || ''}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Bank</TableCell>
            <TableCell>{bank || ''}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Note</TableCell>
            <TableCell>{note || ''}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Date</TableCell>
            <TableCell>{dayjs(createdAt).format('DD/MM/YYYY') || ''}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button onClick={() => handleDelete()} variant="destructive">
        Delete
      </Button>
    </div>
  );
};

export default PaymentDetail;
