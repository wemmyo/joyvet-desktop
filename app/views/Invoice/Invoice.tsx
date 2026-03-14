import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../components/ui/button';
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
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

import { numberWithCommas } from '../../utils/helpers';
import ComponentToPrint from '../../components/PrintedReceipt/ReceiptWrapper';
import { IProduct } from '../../models/product';
import { IInvoiceItem } from '../../models/invoiceItem';
import { IInvoice } from '../../models/invoice';
import {
  getCustomersFn,
  getSingleCustomerFn,
} from '../../controllers/customer.controller';
import {
  createInvoiceFn,
  getSingleInvoiceFn,
} from '../../controllers/invoice.controller';
import { getProductsFn } from '../../controllers/product.controller';
import { ICustomer } from '../../models/customer';

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
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoice, setInvoice] = useState<Partial<IInvoice>>();
  const [printInvoice, setPrintInvoice] = useState(false);
  const [singleCustomer, setSingleCustomer] = useState({} as ICustomer);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [createdInvoice, setCreatedInvoice] = useState<IInvoice>(
    {} as IInvoice
  );

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

  const watchedProduct = watch('product');

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
        autoClose: 5000,
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

  useEffect(() => {
    const fetchData = async () => {
      const getCustomers = getCustomersFn();
      const getproducts = getProductsFn('inStock');
      const [customersResponse, productsResponse] = await Promise.all([
        getCustomers,
        getproducts,
      ]);
      setCustomers(customersResponse);
      setProducts(productsResponse);
    };
    fetchData();
  }, []);

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
        <TableCell>{invoiceItem.quantity}</TableCell>
        <TableCell>{numberWithCommas(invoiceItem.unitPrice)}</TableCell>
        <TableCell>{numberWithCommas(invoiceItem.amount)}</TableCell>
        <TableCell>
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
          <ComponentToPrint ref={componentRef} invoice={createdInvoice} />
        </div>
      );
    }
    return null;
  };

  const createInvoice = async () => {
    await createInvoiceFn(invoiceItems, invoice, async (id) => {
      const response = await getSingleInvoiceFn(id);
      setCreatedInvoice(response);
      setPrintInvoice(true);
      handlePrint?.();
      reset();
      setInvoiceItems([]);
      setInvoice(undefined);
      setCreatedInvoice({} as IInvoice);
    });
  };

  const onSubmit = (values: FormValues) => {
    const product: IProduct = JSON.parse(values.product as any);
    const quantity = Number(values.quantity);
    const unitPrice = Number(values.unitPrice);
    const amount = unitPrice * quantity;
    const profit: number = (unitPrice - product.buyPrice) * quantity;

    updateInvoiceItem({
      id: new Date().getUTCMilliseconds(),
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
        </div>
        <div className="w-72 shrink-0">
          <div className="border rounded p-4 space-y-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  onValueChange={async (val) => {
                    const customerId = Number(val);
                    setInvoice({ ...invoice, customerId });
                    const response = await getSingleCustomerFn(customerId);
                    setSingleCustomer(response);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: ICustomer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="saleType">Sale Type</Label>
                <Select
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
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue('unitPrice', '');
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
                </div>
                {watchedProduct
                  ? renderPrices(
                      JSON.parse(watchedProduct as unknown as string)
                    )
                  : null}

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
              {renderInvoiceToPrint()}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceScreen;
