import type React from 'react';
import { useEffect, useState } from 'react';
import {
  deleteReceiptFn,
  getSingleReceiptFn,
} from '../../../../controllers/receipt.controller';
import type { IReceipt } from '../../../../models/receipt';

import { Button } from '../../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../../../components/ui/table';
import { TableFrame } from '../../../../components/ui/table-helpers';
import { useSidebarContext } from '../../../../contexts/SidebarContext';

export interface ReceiptDetailProps {
  receiptId: string | number;
}

const ReceiptDetail: React.FC<ReceiptDetailProps> = ({
  receiptId,
}: ReceiptDetailProps) => {
  const [singleReceipt, setSingleReceipt] = useState<IReceipt>({} as IReceipt);
  const [loading, setLoading] = useState<boolean>(false);
  const { closeSideContent } = useSidebarContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSingleReceiptFn(receiptId);
      if (response !== null) setSingleReceipt(response);
      setLoading(false);
    };

    fetchData();
  }, [receiptId]);

  const handleDelete = async () => {
    await deleteReceiptFn(receiptId, () => {
      closeSideContent();
    });
  };

  const {
    customer,
    amount,
    note,
    createdAt,
    paymentMethod,
    // paymentType,
    bank,
  } = singleReceipt;

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-3">
      <TableFrame>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Customer</TableCell>
              <TableCell>{customer ? customer.fullName : ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Customer balance</TableCell>
              <TableCell>{customer ? customer.balance : 0.0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Amount</TableCell>
              <TableCell>{amount || ''}</TableCell>
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
                {createdAt
                  ? new Date(createdAt).toLocaleDateString('en-gb')
                  : ''}
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

export default ReceiptDetail;
