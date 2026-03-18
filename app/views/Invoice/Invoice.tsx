import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../components/ui/button';
import AsyncCombobox from '../../components/ui/async-combobox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { TableEmptyRow, TableFrame } from '../../components/ui/table-helpers';
import { useAsyncComboboxOptions } from '../../hooks/useAsyncComboboxOptions';

import { numberWithCommas } from '../../utils/helpers';
import ComponentToPrint from '../../components/PrintedReceipt/ReceiptWrapper';
import { IProduct } from '../../models/product';
import { IInvoiceItem } from '../../models/invoiceItem';
import { IInvoice } from '../../models/invoice';
import {
  getCustomersFn,
  searchCustomerFn,
} from '../../controllers/customer.controller';
import {
  createInvoiceFn,
  getSingleInvoiceFn,
} from '../../controllers/invoice.controller';
import {
  getProductsFn,
  searchProductFn,
} from '../../controllers/product.controller';
import { ICustomer } from '../../models/customer';
import { IStoreInfo } from '../../models/storeInfo';
import { getStoreInfoFn } from '../../controllers/storeInfo.controller';
import { MAX_PAGE_SIZE } from '../../types/pagination';

interface InvoiceItem extends IInvoiceItem {
  product: IProduct;
}

const schema = z.object({
  quantity: z.string().optional().default(''),
  unitPrice: z.string().optional().default(''),
  product: z.string().optional().default(''),
  id: z.string().optional().default(''),
  amount: z.string().optional().default(''),
  profit: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

const InvoiceScreen: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const itemIdCounter = useRef(0);

  const onAfterPrint = useCallback(() => {
    setPrintInvoice(false);
    setCreatedInvoice({} as IInvoice);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoice, setInvoice] = useState<Partial<IInvoice>>();
  const [printInvoice, setPrintInvoice] = useState(false);
  const [singleCustomer, setSingleCustomer] = useState({} as ICustomer);
  const [createdInvoice, setCreatedInvoice] = useState<IInvoice>(
    {} as IInvoice
  );
  const [storeInfo, setStoreInfo] = useState<IStoreInfo | undefined>(undefined);

  useEffect(() => {
    getStoreInfoFn().then((records) => {
      setStoreInfo(records[0]);
    });
  }, []);

  const { register, handleSubmit, control, reset, watch, setValue } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        quantity: '',
        unitPrice: '',
        product: '',
        id: '',
        amount: '',
        profit: '',
      },
    });

  const customerOptions = useAsyncComboboxOptions<ICustomer>({
    getInitialOptions: () => getCustomersFn({ pageSize: MAX_PAGE_SIZE }),
    searchOptions: (search) =>
      searchCustomerFn({
        pageSize: MAX_PAGE_SIZE,
        search,
      }),
    getOptionValue: (customer) => String(customer.id),
    getOptionLabel: (customer) => customer.fullName,
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
  const watchedProduct = watch('product');
  const selectedProduct = watchedProduct
    ? productOptions.getItemByValue(watchedProduct)
    : null;

  const removeInvoiceItem = (id: number) => {
    const filteredItems = invoiceItems.filter((item) => item.id !== id);
    setInvoiceItems(filteredItems);
  };

  const updateInvoiceItem = (updatedItem: InvoiceItem) => {
    // check reorder level
    if (
      updatedItem.product?.stock < updatedItem.quantity ||
      updatedItem.product?.reorderLevel < updatedItem.quantity
    ) {
      toast.error(`${updatedItem.product?.title}: Re-order level`, {
        duration: 5000,
      });
    }

    setInvoiceItems((currentItems) => {
      const itemIndex = currentItems.findIndex(
        (item) => item.product?.id === updatedItem.product.id
      );

      if (itemIndex !== -1) {
        const updatedItems = [...currentItems];
        const existingItem = updatedItems[itemIndex];
        const updatedQuantity = existingItem.quantity + updatedItem.quantity;
        const updatedAmount = updatedItem.unitPrice * updatedQuantity;
        const updatedProfit =
          (updatedItem.unitPrice - updatedItem.product.buyPrice) *
          updatedQuantity;

        updatedItems[itemIndex] = {
          ...existingItem,
          quantity: updatedQuantity,
          amount: updatedAmount,
          profit: updatedProfit,
        };

        return updatedItems;
      }

      return [...currentItems, updatedItem];
    });
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
        (price) => singleCustomer.maxPriceLevel >= price.priceLevel
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
            <Select onValueChange={field.onChange} value={field.value}>
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
      </div>
    );
  };

  useEffect(() => {
    // This effect only needs to track invoiceItems changes for recalculating totals
    const totalAmount = invoiceItems.reduce(
      (acc, item) => acc + item.amount,
      0
    );
    const totalProfit = invoiceItems.reduce(
      (acc, item) => acc + item.profit,
      0
    );
    // Directly updating invoice state with recalculated totals
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      amount: totalAmount,
      profit: totalProfit,
    }));
  }, [invoiceItems]); // Removed JSON.stringify to focus on the specific state dependency

  const renderOrders = invoiceItems.map((invoiceItem, index) => {
    return (
      <TableRow key={invoiceItem.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{invoiceItem.product?.title}</TableCell>
        <TableCell className="text-right">{invoiceItem.quantity}</TableCell>
        <TableCell className="text-right">
          {numberWithCommas(invoiceItem.unitPrice)}
        </TableCell>
        <TableCell className="text-right">
          {numberWithCommas(invoiceItem.amount)}
        </TableCell>
        <TableCell className="text-right">
          <Button
            onClick={() => {
              removeInvoiceItem(invoiceItem.id);
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
          <ComponentToPrint ref={componentRef} invoice={createdInvoice} storeInfo={storeInfo} />
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (printInvoice) {
      handlePrint?.();
    }
  }, [printInvoice, handlePrint]);

  const createInvoice = async () => {
    if (!invoice?.customerId) {
      toast.error('Please select a customer.');
      return;
    }
    if (!invoice?.saleType) {
      toast.error('Please select a sale type.');
      return;
    }
    await createInvoiceFn(invoiceItems, invoice, async (id) => {
      const response = await getSingleInvoiceFn(id);
      reset();
      setInvoiceItems([]);
      setInvoice(undefined);
      if (response) {
        setCreatedInvoice(response);
        setPrintInvoice(true);
      }
    });
  };

  const onSubmit = (values: FormValues) => {
    const product = productOptions.getItemByValue(values.product ?? '');

    if (!product) {
      return;
    }

    const quantity = Number(values.quantity);
    const unitPrice = Number(values.unitPrice);
    const amount = unitPrice * quantity;
    const profit: number = (unitPrice - product.buyPrice) * quantity;

    updateInvoiceItem({
      id: ++itemIdCounter.current,
      quantity,
      unitPrice,
      amount,
      profit,
      product,
    });
    reset();
  };

  return (
    <DashboardLayout screenTitle="Create Invoice">
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
                    message="No invoice items added yet."
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
        </div>
        <div className="w-72 shrink-0">
          <div className="border rounded p-4 space-y-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="customer">Customer</Label>
                <AsyncCombobox
                  value={invoice?.customerId ? String(invoice.customerId) : ''}
                  onValueChange={(val) => {
                    setInvoice((prevInvoice) => ({
                      ...prevInvoice,
                      customerId: Number(val),
                    }));
                    const customer = customerOptions.getItemByValue(val);
                    setSingleCustomer(customer ?? ({} as ICustomer));
                  }}
                  placeholder="Select Customer"
                  searchPlaceholder="Search customers"
                  selectedLabel={customerOptions.getLabelByValue(
                    invoice?.customerId ? String(invoice.customerId) : ''
                  )}
                  options={customerOptions.options}
                  loading={customerOptions.loading}
                  emptyMessage="No customers found."
                  onSearchChange={customerOptions.onSearchChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="saleType">Sale Type</Label>
                <Select
                  value={invoice?.saleType ?? ''}
                  onValueChange={(val) =>
                    setInvoice({ ...invoice, saleType: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Sales</SelectItem>
                    <SelectItem value="credit">Credit Sales</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
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
                          setValue('unitPrice', '');
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
                </div>
                {selectedProduct ? renderPrices(selectedProduct) : null}

                <div className="space-y-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    placeholder="Quantity"
                    type="number"
                    {...register('quantity')}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Item
                </Button>
              </div>
              <Button
                disabled={invoiceItems.length < 1}
                onClick={createInvoice}
                type="button"
                className="w-full"
                variant="default"
              >
                Save
              </Button>
            </form>
            {renderInvoiceToPrint()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceScreen;
