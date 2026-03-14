import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
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

import { getSuppliersFn } from '../../controllers/supplier.controller';
import { getProductsFn } from '../../controllers/product.controller';
import { ISupplier } from '../../models/supplier';
import { IProduct } from '../../models/product';
import { numberWithCommas } from '../../utils/helpers';
import { createPurchaseFn } from '../../controllers/purchase.controller';
import { IPurchaseItem } from '../../models/purchaseItem';

const itemSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  product: z.string().min(1, 'Product is required'),
  unitPrice: z.coerce.number().min(0, 'Unit price is required'),
  quantity: z.coerce.number().min(1, 'Quantity is required'),
  newSellPrice: z.coerce.number().min(0),
  newSellPrice2: z.coerce.number().min(0),
  newSellPrice3: z.coerce.number().min(0),
});

type ItemFormValues = z.infer<typeof itemSchema>;

const PurchaseScreen: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      supplierId: '',
      invoiceNumber: '',
      product: '',
      unitPrice: 0,
      quantity: 0,
      newSellPrice: 0,
      newSellPrice2: 0,
      newSellPrice3: 0,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const fetchData = async () => {
      const getSuppliers = getSuppliersFn();
      const getProducts = getProductsFn();
      const [suppliersResponse, productsResponse] = await Promise.all([
        getSuppliers,
        getProducts,
      ]);
      setSuppliers(suppliersResponse);
      setProducts(productsResponse);
    };
    fetchData();
  }, []);

  const amount = (item: any) => item.amount;
  const sum = (prev: number, next: number) => prev + next;

  const addToOrders = (value: IPurchaseItem) => {
    setOrders([...orders, value]);
  };

  const sumOfOrders = () => {
    if (orders.length === 0) return 0;
    return orders.map(amount).reduce(sum);
  };

  const removeOrder = (orderId: number) => {
    const filteredOrders = orders.filter(
      (item: any) => item.orderId !== orderId
    );
    setOrders(filteredOrders);
  };

  const renderOrders = () => {
    return orders.map((order: any, index) => (
      <TableRow key={order.orderId}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{order.title}</TableCell>
        <TableCell>{order.quantity}</TableCell>
        <TableCell>{numberWithCommas(order.unitPrice)}</TableCell>
        <TableCell>{numberWithCommas(order.amount)}</TableCell>
        <TableCell>
          <Button
            onClick={() => removeOrder(order.orderId)}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  const onAddItem = (values: ItemFormValues) => {
    addToOrders({
      ...JSON.parse(values.product),
      quantity: values.quantity,
      amount: Number(values.unitPrice) * Number(values.quantity),
      unitPrice: values.unitPrice,
      newSellPrice: values.newSellPrice,
      newSellPrice2: values.newSellPrice2,
      newSellPrice3: values.newSellPrice3,
      orderId: new Date().getUTCMilliseconds(),
    });
    reset({
      supplierId: values.supplierId,
      invoiceNumber: values.invoiceNumber,
      product: '',
      unitPrice: 0,
      quantity: 0,
      newSellPrice: 0,
      newSellPrice2: 0,
      newSellPrice3: 0,
    });
  };

  const createPurchase = async () => {
    await createPurchaseFn(orders, {
      supplierId: Number(watchedValues.supplierId),
      invoiceNumber: watchedValues.invoiceNumber,
      amount: sumOfOrders(),
      products: orders,
    } as any);
    reset();
    setOrders([]);
  };

  return (
    <DashboardLayout screenTitle="Create Purchase">
      <div className="flex gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-3">
            Total: ₦{numberWithCommas(sumOfOrders())}
          </h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>{renderOrders()}</TableBody>
          </Table>
          <div className="mt-2 text-sm font-semibold text-right">
            Total: ₦{numberWithCommas(sumOfOrders())}
          </div>
        </div>
        <div className="w-72 shrink-0">
          <div className="border rounded p-4">
            <form onSubmit={handleSubmit(onAddItem)}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="supplierId">Supplier</Label>
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.supplierId && (
                    <p className="text-sm text-destructive">
                      {errors.supplierId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="Invoice Number"
                    {...register('invoiceNumber')}
                  />
                  {errors.invoiceNumber && (
                    <p className="text-sm text-destructive">
                      {errors.invoiceNumber.message}
                    </p>
                  )}
                </div>

                <div className="border rounded p-3 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="product">Item</Label>
                    <Controller
                      name="product"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (val) {
                              const parsed = JSON.parse(val);
                              setValue('newSellPrice', parsed.sellPrice);
                              setValue('newSellPrice2', parsed.sellPrice2);
                              setValue('newSellPrice3', parsed.sellPrice3);
                            }
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Item" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={JSON.stringify(p)}>
                                {p.title}
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

                  <div className="space-y-1">
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      placeholder="Unit Price"
                      {...register('unitPrice')}
                    />
                    {errors.unitPrice && (
                      <p className="text-sm text-destructive">
                        {errors.unitPrice.message}
                      </p>
                    )}
                  </div>

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

                  <div className="space-y-1">
                    <Label htmlFor="newSellPrice">Selling Price</Label>
                    <Input
                      id="newSellPrice"
                      type="number"
                      placeholder="Selling Price"
                      {...register('newSellPrice')}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="newSellPrice2">Selling Price 2</Label>
                    <Input
                      id="newSellPrice2"
                      type="number"
                      placeholder="Selling Price 2"
                      {...register('newSellPrice2')}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="newSellPrice3">Selling Price 3</Label>
                    <Input
                      id="newSellPrice3"
                      type="number"
                      placeholder="Selling Price 3"
                      {...register('newSellPrice3')}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Add Item
                  </Button>
                </div>

                <Button
                  onClick={createPurchase}
                  type="button"
                  className="w-full"
                  variant="default"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseScreen;
