import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../components/ui/table-helpers';
import { useSidebarContext } from '../../../contexts/SidebarContext';
import {
  deletePurchaseFn,
  getSinglePurchaseFn,
} from '../../../controllers/purchase.controller';
import type { IPurchase } from '../../../models/purchase';
import { isAdmin, numberWithCommas } from '../../../utils/helpers';
import EditPurchase from './EditPurchase';

interface SalesDetailProps {
  purchaseId: string | number;
  onRefresh?: () => void;
}

const SalesDetail: React.FC<SalesDetailProps> = ({
  purchaseId,
  onRefresh,
}: SalesDetailProps) => {
  const [purchase, setPurchase] = useState<IPurchase>({} as IPurchase);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const { closeSideContent } = useSidebarContext();

  const fetchPurchase = async () => {
    setLoading(true);
    const response = await getSinglePurchaseFn(Number(purchaseId));
    if (response) setPurchase(response);
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPurchase is stable
  useEffect(() => {
    fetchPurchase();
    setMode('view');
  }, [purchaseId]);

  const handleDelete = async () => {
    try {
      await deletePurchaseFn(purchaseId);
      toast.success('Purchase deleted');
      closeSideContent();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete purchase'
      );
    }
  };

  const renderOrders = () => {
    let serialNumber = 0;
    const orderList = purchase.products?.map((order: any) => {
      serialNumber += 1;
      return (
        <TableRow key={order.id}>
          <TableCell>{serialNumber}</TableCell>
          <TableCell>{order.title}</TableCell>
          <TableCell className="text-right">
            {order.purchaseItem.quantity}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(order.purchaseItem.unitPrice)}
          </TableCell>
          <TableCell className="text-right">
            ₦{numberWithCommas(order.purchaseItem.amount)}
          </TableCell>
        </TableRow>
      );
    });
    return orderList;
  };

  if (loading || !purchase) {
    return <p>Loading...</p>;
  }

  if (mode === 'edit') {
    return (
      <EditPurchase
        purchase={purchase}
        onCancel={() => setMode('view')}
        onSuccess={() => {
          setMode('view');
          fetchPurchase();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <TableFrame>
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
      </TableFrame>

      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {purchase.products?.length ? (
              renderOrders()
            ) : (
              <TableEmptyRow colSpan={5} message="No purchase items found." />
            )}
          </TableBody>
        </Table>
      </TableFrame>

      <div className="flex gap-2">
        {isAdmin() && (
          <Button onClick={() => setMode('edit')} variant="outline">
            Edit
          </Button>
        )}
        <Button
          disabled={!isAdmin()}
          onClick={() => handleDelete()}
          variant="destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default SalesDetail;
