import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AsyncCombobox from '../../../../components/ui/async-combobox';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { useAsyncComboboxOptions } from '../../../../hooks/useAsyncComboboxOptions';
import { numberWithCommas } from '../../../../utils/helpers';
import {
  getCustomersFn,
  searchCustomerFn,
} from '../../../../controllers/customer.controller';
import {
  createReceiptFn,
} from '../../../../controllers/receipt.controller';
import { ICustomer } from '../../../../models/customer';
import { MAX_PAGE_SIZE } from '../../../../types/pagination';

const createReceiptSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.coerce.number().min(1, 'Amount is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  bank: z.string().optional(),
  note: z.string().optional(),
});

type CreateReceiptFormValues = z.infer<typeof createReceiptSchema>;

const CreateReceipt: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [singleCustomer, setSingleCustomer] = useState<ICustomer>(
    {} as ICustomer
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateReceiptFormValues>({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      customerId: '',
      amount: 0,
      paymentMethod: '',
      bank: '',
      note: '',
    },
  });

  const watchedPaymentMethod = watch('paymentMethod');
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

  const handleNewReceipt = (values: CreateReceiptFormValues) => {
    createReceiptFn(
      {
        ...values,
        customerId: Number(values.customerId),
        amount: Number(values.amount),
      },
      () => {
        onRefresh?.();
      }
    );
  };

  const showCustomerBalance = () => {
    if (singleCustomer.balance) {
      return (
        <div className="rounded border bg-muted px-3 py-2 text-sm mb-3">
          {`Balance: ${numberWithCommas(singleCustomer.balance)}`}
        </div>
      );
    }
    return null;
  };

  const renderBanks = (paymentMethod: string) => {
    if (paymentMethod === 'transfer') {
      return (
        <div className="space-y-1 mb-3">
          <Label htmlFor="bank">Bank</Label>
          <Controller
            name="bank"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GTB">GTB</SelectItem>
                  <SelectItem value="FCMB">FCMB</SelectItem>
                  <SelectItem value="First Bank">First Bank</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      );
    }
    return null;
  };

  const onSubmit = (values: CreateReceiptFormValues) => {
    handleNewReceipt(values);
    reset();
    setSingleCustomer({} as ICustomer);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="customerId">Customer</Label>
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <AsyncCombobox
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  const customer = customerOptions.getItemByValue(val);
                  setSingleCustomer(customer ?? ({} as ICustomer));
                }}
                placeholder="Select Customer"
                searchPlaceholder="Search customers"
                selectedLabel={customerOptions.getLabelByValue(field.value)}
                options={customerOptions.options}
                loading={customerOptions.loading}
                emptyMessage="No customers found."
                onSearchChange={customerOptions.onSearchChange}
              />
            )}
          />
          {errors.customerId && (
            <p className="text-sm text-destructive">
              {errors.customerId.message}
            </p>
          )}
        </div>

        {showCustomerBalance()}

        <div className="space-y-1">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="text"
            placeholder="Amount"
            {...register('amount')}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentMethod && (
            <p className="text-sm text-destructive">
              {errors.paymentMethod.message}
            </p>
          )}
        </div>

        {renderBanks(watchedPaymentMethod)}

        <div className="space-y-1">
          <Label htmlFor="note">Note</Label>
          <Input
            id="note"
            type="text"
            placeholder="Note"
            {...register('note')}
          />
        </div>

        <Button type="submit" className="w-full">
          Save
        </Button>
      </div>
    </form>
  );
};

export default CreateReceipt;
