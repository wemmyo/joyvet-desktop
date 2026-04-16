import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../../components/ui/table';
import { TableFrame } from '../../../../components/ui/table-helpers';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  deletePaymentFn,
  getSinglePaymentFn,
} from '../../../../controllers/payment.controller';
import type { IPayment } from '../../../../models/payment';
import { numberWithCommas } from '../../../../utils/helpers';

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
      if (response !== null) setSinglePayment(response);
      setLoading(false);
    };

    fetchData();
  }, [paymentId]);

  const handleDelete = async () => {
    try {
      await deletePaymentFn(paymentId);
      toast.success('Payment deleted');
      refreshPayments();
      closeSideContent();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete payment'
      );
    }
  };

  const { supplier, amount, note, createdAt, paymentMethod, bank } =
    singlePayment;

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-3">
      <TableFrame>
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
              <TableCell>
                {dayjs(createdAt).format('DD/MM/YYYY') || ''}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableFrame>
      <Button onClick={() => handleDelete()} variant="destructive">
        Delete
      </Button>
    </div>
  );
};

export default PaymentDetail;
