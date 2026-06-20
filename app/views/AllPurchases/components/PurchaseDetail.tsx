import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
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
  const [forceDialogOpen, setForceDialogOpen] = useState(false);
  const [forcing, setForcing] = useState(false);

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

  // The stock-revert guard in the main process rejects a delete whose items
  // were already sold (reverting would push stock negative). It's the only
  // error that offers a force-delete path.
  const isStockGuardError = (error: unknown): boolean =>
    error instanceof Error && error.message.includes('Cannot delete purchase');

  const handleDelete = async () => {
    try {
      await deletePurchaseFn(purchaseId);
      closeSideContent();
      onRefresh?.();
    } catch (err: unknown) {
      // Offer admins a force-delete when the block is the stock guard;
      // surface anything else as a plain error.
      if (isAdmin() && isStockGuardError(err)) {
        setForceDialogOpen(true);
        return;
      }
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete purchase'
      );
    }
  };

  const handleForceDelete = async () => {
    setForcing(true);
    try {
      await deletePurchaseFn(purchaseId, { force: true });
      setForceDialogOpen(false);
      closeSideContent();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete purchase'
      );
    } finally {
      setForcing(false);
    }
  };

  // Best-effort list of products whose stock would go to/below zero, shown in
  // the force-delete warning. Based on the loaded snapshot; the main process
  // remains the source of truth.
  const atRiskProducts = (purchase.products ?? []).filter(
    (product: any) => product.stock - product.purchaseItem?.quantity < 0
  );

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

      <AlertDialog open={forceDialogOpen} onOpenChange={setForceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force delete this purchase?</AlertDialogTitle>
            <AlertDialogDescription>
              Some items from this purchase have already been sold, so reversing
              it would reduce stock below what is currently available. Forcing
              the delete will still subtract the purchased quantity and may set
              stock to zero or a negative value. This cannot be undone — you
              should reconcile the affected stock afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {atRiskProducts.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {atRiskProducts.map((product: any) => (
                <li key={product.id}>
                  <span className="font-medium">{product.title}</span>: stock{' '}
                  {product.stock} →{' '}
                  {product.stock - product.purchaseItem.quantity}
                </li>
              ))}
            </ul>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={forcing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={forcing}
              onClick={(event) => {
                // Keep the dialog open while the async force-delete runs;
                // it closes itself on success.
                event.preventDefault();
                handleForceDelete();
              }}
            >
              {forcing ? 'Deleting…' : 'Force delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesDetail;
