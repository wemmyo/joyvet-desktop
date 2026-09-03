import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import AsyncCombobox from '../../../../components/ui/async-combobox';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  getCustomersFn,
  searchCustomerFn,
} from '../../../../controllers/customer.controller';
import {
  getSingleReceiptFn,
  updateReceiptFn,
} from '../../../../controllers/receipt.controller';
import { useAsyncComboboxOptions } from '../../../../hooks/useAsyncComboboxOptions';
import type { ICustomer } from '../../../../models/customer';
import type { IReceipt } from '../../../../models/receipt';
import { MAX_PAGE_SIZE } from '../../../../types/pagination';

const schema = z.object({
  customerId: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  note: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

export interface EditReceiptProps {
  receiptId: string | number;
  onRefresh?: () => void;
}

const EditReceipt: React.FC<EditReceiptProps> = ({
  receiptId,
  onRefresh,
}: EditReceiptProps) => {
  const { closeSideContent } = useSidebarContext();
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

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: getSingleReceiptFn and customerOptions are stable
  useEffect(() => {
    const fetchData = async () => {
      const getSingleReceipt = getSingleReceiptFn(receiptId);
      const receiptResponse = await getSingleReceipt;
      if (!receiptResponse) return;
      const receipt: IReceipt = receiptResponse;
      reset({
        customerId: receipt.customerId ? String(receipt.customerId) : '',
        amount: receipt.amount ? String(receipt.amount) : '',
        note: receipt.note || '',
      });
      if (receipt.customer) {
        customerOptions.primeItems([receipt.customer]);
      }
    };
    fetchData();
  }, [receiptId, reset]);

  const onSubmit = async (values: FormValues) => {
    await updateReceiptFn(
      {
        ...values,
        customerId: Number(values.customerId),
        amount: Number(values.amount),
      },
      receiptId,
      () => {
        closeSideContent();
        onRefresh?.();
      }
    )();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="customerId">Customer</Label>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <AsyncCombobox
              value={field.value}
              onValueChange={field.onChange}
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
          <p className="text-sm text-destructive mt-1">
            {errors.customerId.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="amount">Amount Paid</Label>
        <Input
          id="amount"
          placeholder="Amount Paid"
          type="text"
          {...register('amount')}
          className={errors.amount ? 'border-destructive' : ''}
        />
        {errors.amount && (
          <p className="text-sm text-destructive mt-1">
            {errors.amount.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="note">Note</Label>
        <Input id="note" placeholder="Note" type="text" {...register('note')} />
      </div>

      <Button type="submit" className="w-full">
        Update
      </Button>
    </form>
  );
};
export default EditReceipt;
