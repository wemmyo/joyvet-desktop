import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import DashboardLayout from '../../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/table';

import { numberWithCommas } from '../../../utils/helpers';
import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';
import { IProduct } from '../../../models/product';
import { IInvoiceItem } from '../../../models/invoiceItem';
import { IInvoice } from '../../../models/invoice';
import {
  addInvoiceItemFn,
  deleteInvoiceItemFn,
  getSingleInvoiceFn,
} from '../../../controllers/invoice.controller';
import { getProductsFn } from '../../../controllers/product.controller';
import { ICustomer } from '../../../models/customer';

interface InvoiceItem extends IInvoiceItem {
  product: IProduct;
}

const invoiceItemSchema = z.object({
  quantity: z.coerce.number().min(1, 'Quantity is required'),
  unitPrice: z.coerce.number().min(0, 'Unit price is required'),
  product: z.string().min(1, 'Product is required'),
});

type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

const InvoiceScreen: React.FC = ({ match }: any) => {
  const invoiceId = match.params.id;

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoice, setInvoice] = useState<IInvoice>({} as IInvoice);
  const [printInvoice, setPrintInvoice] = useState(false);
  const [singleCustomer, setSingleCustomer] = useState({} as ICustomer);
  const [products, setProducts] = useState<IProduct[]>([]);

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

  const watchedProduct = watch('product');

  const fetchData = useCallback(async () => {
    const getproducts = getProductsFn('inStock');
    const getSingleInvoice = getSingleInvoiceFn(Number(invoiceId));
    const [productsResponse, singleInvoiceResponse] = await Promise.all([
      getproducts,
      getSingleInvoice,
    ]);
    setProducts(productsResponse);

    setInvoice({
      ...singleInvoiceResponse,
      customerId: singleInvoiceResponse.customer.id,
      saleType: singleInvoiceResponse.saleType,
      id: singleInvoiceResponse.id,
      createdAt: singleInvoiceResponse.createdAt,
    });

    const invoiceItemList: InvoiceItem[] = [];

    singleInvoiceResponse.products.forEach((product) => {
      const { invoiceItem } = product;
      const item: InvoiceItem = {
        id: invoiceItem.id,
        quantity: invoiceItem.quantity,
        unitPrice: invoiceItem.unitPrice,
        amount: invoiceItem.amount,
        profit: invoiceItem.profit,
        product,
      };
      invoiceItemList.push(item);
    });

    setInvoiceItems(invoiceItemList);
    setSingleCustomer(singleInvoiceResponse.customer);
  }, [invoiceId]);

  useEffect(() => {
    fetchData();
  }, [invoiceId, fetchData]);

  const removeInvoiceItem = async (
    invoiceItemId: number,
    productId: number
  ) => {
    await deleteInvoiceItemFn({
      productId,
      invoiceId: Number(invoiceId),
      invoiceItemId,
    });
    fetchData();
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
    return (
      <TableRow key={invoiceItem.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{invoiceItem.product?.title}</TableCell>
        <TableCell>{invoiceItem.quantity}</TableCell>
        <TableCell>{numberWithCommas(invoiceItem.unitPrice)}</TableCell>
        <TableCell>{numberWithCommas(invoiceItem.amount)}</TableCell>
        <TableCell>
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
          <ComponentToPrint ref={componentRef} invoice={invoice} />
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
      setPrintInvoice(false);
    }
  }, [printInvoice, handlePrint]);

  const disabledAdditem = () => {
    const invoiceDate = dayjs(invoice?.createdAt).format('DD/MM/YYYY');
    const todaysDate = dayjs().format('DD/MM/YYYY');

    if (invoiceDate === todaysDate) {
      return false;
    }
    return true;
  };

  const onSubmit = async (values: InvoiceItemFormValues) => {
    const product: IProduct = JSON.parse(values.product as any);
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

  return (
    <DashboardLayout screenTitle="Update Invoice">
      <div className="flex gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-3">
            Total: ₦{invoice?.amount ? numberWithCommas(invoice.amount) : 0}
          </h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>{renderOrders}</TableBody>
          </Table>
          <div className="mt-2 text-sm font-semibold text-right">
            Total: ₦{invoice?.amount ? numberWithCommas(invoice.amount) : 0}
          </div>
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
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            setValue('unitPrice', 0);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem
                                key={product.id}
                                value={JSON.stringify(product)}
                              >
                                {product.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.product && (
                      <p className="text-sm text-destructive">
                        {errors.product.message}
                      </p>
                    )}
                  </div>
                  {watchedProduct
                    ? renderPrices(JSON.parse(watchedProduct as string))
                    : null}

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
    </DashboardLayout>
  );
};

export default InvoiceScreen;
