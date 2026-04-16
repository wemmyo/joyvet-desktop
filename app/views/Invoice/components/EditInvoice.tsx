import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { z } from 'zod';

import AsyncCombobox from '../../../components/ui/async-combobox';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../components/ui/table-helpers';
import { useAsyncComboboxOptions } from '../../../hooks/useAsyncComboboxOptions';
import DashboardLayout from '../../../layouts/DashboardLayout/DashboardLayout';

import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';
import {
  addInvoiceItemFn,
  deleteInvoiceItemFn,
  getSingleInvoiceFn,
  updateInvoiceItemFn,
} from '../../../controllers/invoice.controller';
import {
  getProductsFn,
  searchProductFn,
} from '../../../controllers/product.controller';
import { getStoreInfoFn } from '../../../controllers/storeInfo.controller';
import type { ICustomer } from '../../../models/customer';
import type { IInvoice } from '../../../models/invoice';
import type { IInvoiceItem } from '../../../models/invoiceItem';
import type { IProduct } from '../../../models/product';
import type { IStoreInfo } from '../../../models/storeInfo';
import { MAX_PAGE_SIZE } from '../../../types/pagination';
import { numberWithCommas } from '../../../utils/helpers';
import { isAdmin } from '../../../utils/helpers';
import InvoiceAuditLog from './InvoiceAuditLog';

interface InvoiceItem extends IInvoiceItem {
  product: IProduct;
}

const invoiceItemSchema = z.object({
  quantity: z.coerce.number().min(1, 'Quantity is required'),
  unitPrice: z.coerce.number().min(0, 'Unit price is required'),
  product: z.string().min(1, 'Product is required'),
});

type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

const InvoiceScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const invoiceId = Number(id);
  const hasValidInvoiceId = Number.isInteger(invoiceId) && invoiceId > 0;

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintInvoice(false),
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoice, setInvoice] = useState<IInvoice>({} as IInvoice);
  const [printInvoice, setPrintInvoice] = useState(false);
  const [singleCustomer, setSingleCustomer] = useState({} as ICustomer);
  const [storeInfo, setStoreInfo] = useState<IStoreInfo | undefined>(undefined);

  useEffect(() => {
    getStoreInfoFn().then((records) => {
      setStoreInfo(records[0]);
    });
  }, []);
  const [editingQtyId, setEditingQtyId] = useState<number | null>(null);
  const [editingQtyValue, setEditingQtyValue] = useState<number>(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<InvoiceItemFormValues>({
    resolver: zodResolver(invoiceItemSchema),
    defaultValues: { quantity: 0, unitPrice: 0, product: '' },
  });

  const productOptions = useAsyncComboboxOptions<IProduct>({
    getInitialOptions: () =>
      getProductsFn({ filter: 'inStock', pageSize: MAX_PAGE_SIZE }),
    searchOptions: (search) =>
      searchProductFn({
        filter: 'inStock',
        pageSize: MAX_PAGE_SIZE,
        search,
      }),
    getOptionValue: (product) => String(product.id),
    getOptionLabel: (product) => product.title,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: productOptions and setters are stable
  const fetchData = useCallback(async () => {
    if (!hasValidInvoiceId) {
      setInvoiceItems([]);
      setInvoice({} as IInvoice);
      setSingleCustomer({} as ICustomer);
      return;
    }

    const getSingleInvoice = getSingleInvoiceFn(invoiceId);
    const singleInvoiceResponse = await getSingleInvoice;
    if (!singleInvoiceResponse) {
      return;
    }

    setInvoice({
      ...singleInvoiceResponse,
      customerId: singleInvoiceResponse.customer?.id ?? 0,
      saleType: singleInvoiceResponse.saleType,
      id: singleInvoiceResponse.id,
      createdAt: singleInvoiceResponse.createdAt,
    });

    const invoiceItemList: InvoiceItem[] = [];

    for (const product of singleInvoiceResponse.products ?? []) {
      const { invoiceItem } = product;
      if (!invoiceItem) continue;
      const item: InvoiceItem = {
        id: invoiceItem.id,
        quantity: invoiceItem.quantity,
        unitPrice: invoiceItem.unitPrice,
        amount: invoiceItem.amount,
        profit: invoiceItem.profit,
        product,
      };
      invoiceItemList.push(item);
    }

    setInvoiceItems(invoiceItemList);
    setSingleCustomer(singleInvoiceResponse.customer ?? ({} as ICustomer));
    productOptions.primeItems(singleInvoiceResponse.products ?? []);
  }, [hasValidInvoiceId, invoiceId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep list
  useEffect(() => {
    fetchData();
  }, [invoiceId, fetchData]);

  const watchedProduct = watch('product');
  const selectedProduct = watchedProduct
    ? productOptions.getItemByValue(watchedProduct)
    : null;

  const removeInvoiceItem = async (
    invoiceItemId: number,
    productId: number
  ) => {
    try {
      await deleteInvoiceItemFn({
        productId,
        invoiceId,
        invoiceItemId,
      });
      fetchData();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const startEditQty = (item: InvoiceItem) => {
    setEditingQtyId(item.id);
    setEditingQtyValue(item.quantity);
  };

  const cancelEditQty = () => {
    setEditingQtyId(null);
    setEditingQtyValue(0);
  };

  const saveEditQty = async (item: InvoiceItem) => {
    if (editingQtyValue <= 0) return;
    try {
      await updateInvoiceItemFn({
        invoiceItemId: item.id,
        invoiceId,
        productId: item.product.id,
        newQuantity: editingQtyValue,
      });
      setEditingQtyId(null);
      fetchData();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const renderPrices = (product: IProduct) => {
    interface IProductPrice {
      label: string;
      value: number;
      priceLevel: number;
    }

    const productPrices = [
      { label: 'Level 1', value: product.sellPrice, priceLevel: 1 },
      { label: 'Level 2', value: product.sellPrice2, priceLevel: 2 },
      { label: 'Level 3', value: product.sellPrice3, priceLevel: 3 },
      { label: 'Level 4', value: product.buyPrice, priceLevel: 4 },
    ];

    let filteredPriceLevel: IProductPrice[] = [];

    if (singleCustomer?.maxPriceLevel) {
      const availablePrices = productPrices.filter(
        (price) => (singleCustomer.maxPriceLevel ?? 0) >= price.priceLevel
      );
      filteredPriceLevel = availablePrices;
    } else {
      const defaultPrices = productPrices.filter(
        (price) => price.priceLevel <= 2
      );
      filteredPriceLevel = defaultPrices;
    }

    return (
      <div className="space-y-1">
        <Label htmlFor="unitPrice">Unit Price</Label>
        <Controller
          name="unitPrice"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value ? String(field.value) : ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Price" />
              </SelectTrigger>
              <SelectContent>
                {filteredPriceLevel.map((price) => (
                  <SelectItem key={price.label} value={String(price.value)}>
                    {`${price.label}: ₦${numberWithCommas(price.value)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.unitPrice && (
          <p className="text-sm text-destructive">{errors.unitPrice.message}</p>
        )}
      </div>
    );
  };

  const renderOrders = invoiceItems.map((invoiceItem, index) => {
    const isEditingThis = editingQtyId === invoiceItem.id;
    return (
      <TableRow key={invoiceItem.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{invoiceItem.product?.title}</TableCell>
        <TableCell className="text-right">
          {isEditingThis ? (
            <div className="flex items-center gap-1 justify-end">
              <Input
                type="number"
                min={1}
                value={editingQtyValue}
                onChange={(e) => setEditingQtyValue(Number(e.target.value))}
                className="w-16 text-right"
                autoFocus
              />
              <Button size="sm" onClick={() => saveEditQty(invoiceItem)}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEditQty}>
                ✕
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="underline-offset-2 hover:underline cursor-pointer"
              onClick={() => startEditQty(invoiceItem)}
              title="Click to edit quantity"
            >
              {invoiceItem.quantity}
            </button>
          )}
        </TableCell>
        <TableCell className="text-right">
          {numberWithCommas(invoiceItem.unitPrice)}
        </TableCell>
        <TableCell className="text-right">
          {numberWithCommas(invoiceItem.amount)}
        </TableCell>
        <TableCell className="text-right">
          <Button
            onClick={() => {
              removeInvoiceItem(invoiceItem.id, invoiceItem.product.id);
            }}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
        </TableCell>
      </TableRow>
    );
  });

  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return (
        <div style={{ display: 'none' }}>
          <ComponentToPrint
            ref={componentRef}
            invoice={invoice}
            storeInfo={storeInfo}
          />
        </div>
      );
    }
    return null;
  };

  const handlePrintInvoice = () => {
    setPrintInvoice(true);
  };

  useEffect(() => {
    if (printInvoice) {
      handlePrint?.();
    }
  }, [printInvoice, handlePrint]);

  // Admins can add items at any time; non-admins are restricted to same-day
  const disabledAdditem = () => {
    if (isAdmin()) return false;
    const invoiceDate = invoice?.createdAt
      ? new Date(invoice.createdAt).toDateString()
      : '';
    const todaysDate = new Date().toDateString();
    return invoiceDate !== todaysDate;
  };

  const onSubmit = async (values: InvoiceItemFormValues) => {
    if (!hasValidInvoiceId) {
      return;
    }

    const product = productOptions.getItemByValue(values.product);
    if (!product) {
      return;
    }

    const quantity = Number(values.quantity);
    const unitPrice = Number(values.unitPrice);
    const amount = unitPrice * quantity;
    const profit: number = (unitPrice - product.buyPrice) * quantity;

    const updatedItem = {
      quantity,
      unitPrice,
      amount,
      profit,
      product,
    };

    await addInvoiceItemFn(invoice, updatedItem);
    await fetchData();

    reset({ quantity: 0, unitPrice: 0, product: '' });
  };

  if (!hasValidInvoiceId) {
    return (
      <DashboardLayout screenTitle="Edit Invoice">
        <p className="text-sm text-muted-foreground">
          Invalid invoice selected.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout screenTitle="Update Invoice">
      <div className="flex gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-3">
            Total: ₦{invoice?.amount ? numberWithCommas(invoice.amount) : 0}
          </h1>
          <TableFrame>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoiceItems.length > 0 ? (
                  renderOrders
                ) : (
                  <TableEmptyRow
                    colSpan={6}
                    message="No invoice items available."
                  />
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>Total</TableCell>
                  <TableCell className="text-right">
                    ₦{invoice?.amount ? numberWithCommas(invoice.amount) : 0}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableFrame>
          <p className="text-sm text-muted-foreground mt-2">
            Note: Use same price level when updating existing product quantity
          </p>
        </div>
        <div className="w-72 shrink-0">
          <div className="border rounded p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="customer">Customer</Label>
                  <Select disabled value={singleCustomer.fullName || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder={singleCustomer.fullName} />
                    </SelectTrigger>
                    <SelectContent>
                      {singleCustomer.fullName && (
                        <SelectItem value={singleCustomer.fullName}>
                          {singleCustomer.fullName}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="saleType">Sale Type</Label>
                  <Select disabled value={invoice?.saleType || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder={invoice?.saleType} />
                    </SelectTrigger>
                    <SelectContent>
                      {invoice?.saleType && (
                        <SelectItem value={invoice.saleType}>
                          {invoice.saleType}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded p-3 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="product">Product</Label>
                    <Controller
                      name="product"
                      control={control}
                      render={({ field }) => (
                        <AsyncCombobox
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setValue('unitPrice', 0);
                          }}
                          placeholder="Select Product"
                          searchPlaceholder="Search products"
                          selectedLabel={productOptions.getLabelByValue(
                            field.value
                          )}
                          options={productOptions.options}
                          loading={productOptions.loading}
                          emptyMessage="No products found."
                          onSearchChange={productOptions.onSearchChange}
                        />
                      )}
                    />
                    {errors.product && (
                      <p className="text-sm text-destructive">
                        {errors.product.message}
                      </p>
                    )}
                  </div>
                  {selectedProduct ? renderPrices(selectedProduct) : null}

                  <div className="space-y-1">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Quantity"
                      {...register('quantity')}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-destructive">
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={disabledAdditem()}
                  >
                    Add Item
                  </Button>
                </div>
                <Button
                  onClick={handlePrintInvoice}
                  type="button"
                  className="w-full"
                  variant="outline"
                >
                  Print
                </Button>
                {renderInvoiceToPrint()}
              </div>
            </form>
          </div>
        </div>
      </div>
      {hasValidInvoiceId && <InvoiceAuditLog invoiceId={invoiceId} />}
    </DashboardLayout>
  );
};

export default InvoiceScreen;
