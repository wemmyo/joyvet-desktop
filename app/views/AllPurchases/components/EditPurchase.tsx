import { Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
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
import { updatePurchaseFn } from '../../../controllers/purchase.controller';
import type { IPurchase } from '../../../models/purchase';
import { numberWithCommas } from '../../../utils/helpers';

interface EditPurchaseProps {
  purchase: IPurchase;
  onCancel: () => void;
  onSuccess: () => void;
}

interface EditableItem {
  productId: number;
  title: string;
  quantity: number;
  unitPrice: number;
  sellPrice: number;
  sellPrice2: number;
  sellPrice3: number;
}

const EditPurchase: React.FC<EditPurchaseProps> = ({
  purchase,
  onCancel,
  onSuccess,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    purchase.invoiceNumber || ''
  );
  const [items, setItems] = useState<EditableItem[]>(
    (purchase.products || []).map((p: any) => ({
      productId: p.id,
      title: p.title,
      quantity: p.purchaseItem?.quantity ?? 0,
      unitPrice: p.purchaseItem?.unitPrice ?? 0,
      sellPrice: p.purchaseItem?.sellPrice ?? p.sellPrice ?? 0,
      sellPrice2: p.purchaseItem?.sellPrice2 ?? p.sellPrice2 ?? 0,
      sellPrice3: p.purchaseItem?.sellPrice3 ?? p.sellPrice3 ?? 0,
    }))
  );
  const [saving, setSaving] = useState(false);

  const updateItem = (
    index: number,
    field: keyof EditableItem,
    value: number | string
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const computedTotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  const handleSave = async () => {
    if (!invoiceNumber.trim()) {
      toast.error('Invoice number is required');
      return;
    }

    if (items.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Quantity must be greater than 0 for "${item.title}"`);
        return;
      }
      if (item.unitPrice < 0) {
        toast.error(`Unit price cannot be negative for "${item.title}"`);
        return;
      }
    }

    const purchaseItems = items.map((item) => ({
      id: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.quantity) * Number(item.unitPrice),
      newSellPrice: Number(item.sellPrice),
      newSellPrice2: Number(item.sellPrice2),
      newSellPrice3: Number(item.sellPrice3),
    }));

    const meta = {
      invoiceNumber: invoiceNumber.trim(),
      amount: computedTotal,
    };

    setSaving(true);
    try {
      await updatePurchaseFn(purchase.id, purchaseItems, meta as any);
      onSuccess();
    } catch {
      // error already shown by updatePurchaseFn
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Invoice Number"
        />
      </div>

      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', Number(e.target.value))
                      }
                      className="w-20 ml-auto text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, 'unitPrice', Number(e.target.value))
                      }
                      className="w-28 ml-auto text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    ₦{numberWithCommas(item.quantity * item.unitPrice)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyRow
                colSpan={5}
                message="No items. Add products above."
              />
            )}
          </TableBody>
        </Table>
      </TableFrame>

      <div className="text-right text-sm font-medium">
        Total: ₦{numberWithCommas(computedTotal)}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditPurchase;
