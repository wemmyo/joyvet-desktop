import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { numberWithCommas } from '../../../../utils/helpers';
import { createPaymentFn } from '../../../../controllers/payment.controller';
import {
  getSuppliersFn,
  getSingleSupplierFn,
} from '../../../../controllers/supplier.controller';
import { ISupplier } from '../../../../models/supplier';

interface ICreatePayment {
  refreshPayments: () => void;
}

const createPaymentSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  amount: z.coerce.number().min(1, 'Amount is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  bank: z.string().optional(),
  note: z.string().optional(),
});

type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>;

const CreatePayment = ({ refreshPayments }: ICreatePayment) => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [singleSupplier, setSingleSupplier] = useState<ISupplier>(
    {} as ISupplier
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      supplierId: '',
      amount: 0,
      paymentMethod: '',
      bank: '',
      note: '',
    },
  });

  const watchedPaymentMethod = watch('paymentMethod');

  useEffect(() => {
    const fetchSuppliers = async () => {
      const response = await getSuppliersFn();
      setSuppliers(response);
    };
    fetchSuppliers();
  }, []);

  const showSupplierBalance = () => {
    if (singleSupplier.balance) {
      return (
        <div className="rounded border bg-muted px-3 py-2 text-sm mb-3">
          {`Balance: ${numberWithCommas(singleSupplier.balance)}`}
        </div>
      );
    }
    return null;
  };

  const renderBanks = (paymentMethod: string) => {
    if (paymentMethod === 'transfer') {
      return (
        <div className="space-y-1">
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
                  <SelectItem value="UBA">UBA</SelectItem>
                  <SelectItem value="Zenith">Zenith</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      );
    }
    return null;
  };

  const onSubmit = async (values: CreatePaymentFormValues) => {
    await createPaymentFn({
      ...values,
      supplierId: Number(values.supplierId),
      amount: Number(values.amount),
    });
    refreshPayments();
    reset();
    setSingleSupplier({} as ISupplier);
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
              <Select
                onValueChange={async (val) => {
                  field.onChange(val);
                  const supplier = await getSingleSupplierFn(Number(val));
                  if (supplier) setSingleSupplier(supplier);
                }}
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

        {showSupplierBalance()}

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

export default CreatePayment;
