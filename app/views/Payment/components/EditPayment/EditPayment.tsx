import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AsyncCombobox from '../../../../components/ui/async-combobox';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { useAsyncComboboxOptions } from '../../../../hooks/useAsyncComboboxOptions';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  getPaymentsFn,
  getSinglePaymentFn,
  updatePaymentFn,
} from '../../../../controllers/payment.controller';
import {
  getSuppliersFn,
  searchSupplierFn,
} from '../../../../controllers/supplier.controller';
import { IPayment } from '../../../../models/payment';
import { ISupplier } from '../../../../models/supplier';
import { MAX_PAGE_SIZE } from '../../../../types/pagination';

export interface EditPaymentProps {
  paymentId: string | number;
}

const editPaymentSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  amount: z.coerce.number().min(0, 'Amount is required'),
  note: z.string().optional(),
});

type EditPaymentFormValues = z.infer<typeof editPaymentSchema>;

const EditPayment: React.FC<EditPaymentProps> = ({
  paymentId,
}: EditPaymentProps) => {
  const { closeSideContent } = useSidebarContext();
  const supplierOptions = useAsyncComboboxOptions<ISupplier>({
    getInitialOptions: () => getSuppliersFn({ pageSize: MAX_PAGE_SIZE }),
    searchOptions: (search) =>
      searchSupplierFn({
        pageSize: MAX_PAGE_SIZE,
        search,
      }),
    getOptionValue: (supplier) => String(supplier.id),
    getOptionLabel: (supplier) => supplier.fullName,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EditPaymentFormValues>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: {
      supplierId: '',
      amount: 0,
      note: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const paymentResponse = await getSinglePaymentFn(Number(paymentId));
      reset({
        supplierId: paymentResponse.supplierId
          ? String(paymentResponse.supplierId)
          : '',
        amount: paymentResponse.amount || 0,
        note: paymentResponse.note || '',
      });
      if (paymentResponse.supplier) {
        supplierOptions.primeItems([paymentResponse.supplier]);
      }
    };
    fetchData();
  }, [paymentId, reset]);

  const onSubmit = async (values: EditPaymentFormValues) => {
    await updatePaymentFn(
      {
        ...values,
        supplierId: Number(values.supplierId),
        amount: Number(values.amount),
      },
      Number(paymentId)
    );
    closeSideContent();
    await getPaymentsFn();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="supplierId">Supplier</Label>
          <Controller
            name="supplierId"
            control={control}
            render={({ field }) => (
              <AsyncCombobox
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select Supplier"
                searchPlaceholder="Search suppliers"
                selectedLabel={supplierOptions.getLabelByValue(field.value)}
                options={supplierOptions.options}
                loading={supplierOptions.loading}
                emptyMessage="No suppliers found."
                onSearchChange={supplierOptions.onSearchChange}
              />
            )}
          />
          {errors.supplierId && (
            <p className="text-sm text-destructive">
              {errors.supplierId.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Amount"
            {...register('amount')}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

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
          Update
        </Button>
      </div>
    </form>
  );
};

export default EditPayment;
