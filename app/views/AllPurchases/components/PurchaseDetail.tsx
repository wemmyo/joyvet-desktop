import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { isAdmin, numberWithCommas } from '../../../utils/helpers';
import { useSidebarContext } from '../../../contexts/SidebarContext';
import { IPurchase } from '../../../models/purchase';
import {
  deletePurchaseFn,
  getPurchasesFn,
  getSinglePurchaseFn,
} from '../../../controllers/purchase.controller';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/table';

interface SalesDetailProps {
  purchaseId: string | number;
}

const SalesDetail: React.FC<SalesDetailProps> = ({
  purchaseId,
}: SalesDetailProps) => {
  const [purchase, setPurchase] = useState<IPurchase>({} as IPurchase);
  const [loading, setLoading] = useState(false);

  const { closeSideContent } = useSidebarContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSinglePurchaseFn(Number(purchaseId));
      setPurchase(response);
      setLoading(false);
    };
    fetchData();
  }, [purchaseId]);

  const handleDelete = async () => {
    await deletePurchaseFn(purchaseId);
    await getPurchasesFn();
    closeSideContent();
  };

  const renderOrders = () => {
    let serialNumber = 0;
    const orderList = purchase.products?.map((order: any) => {
      serialNumber += 1;
      return (
        <TableRow key={order.id}>
          <TableCell>{serialNumber}</TableCell>
          <TableCell>{order.title}</TableCell>
          <TableCell>{order.purchaseItem.quantity}</TableCell>
          <TableCell>
            ₦{numberWithCommas(order.purchaseItem.unitPrice)}
          </TableCell>
          <TableCell>₦{numberWithCommas(order.purchaseItem.amount)}</TableCell>
        </TableRow>
      );
    });
    return orderList;
  };

  if (loading || !purchase) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Invoice Number</TableCell>
            <TableCell>{purchase.invoiceNumber}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Supplier</TableCell>
            <TableCell>{purchase.supplier?.fullName}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Amount</TableCell>
            <TableCell>{numberWithCommas(purchase.amount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Date Posted</TableCell>
            <TableCell>
              {dayjs(purchase.createdAt).format('DD/MM/YYYY')}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>{renderOrders()}</TableBody>
      </Table>
      <Button
        disabled={!isAdmin()}
        onClick={() => handleDelete()}
        variant="destructive"
      >
        Delete
      </Button>
    </div>
  );
};

export default SalesDetail;
