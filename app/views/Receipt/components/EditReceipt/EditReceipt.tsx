import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  updateReceiptFn,
  getReceiptsFn,
  getSingleReceiptFn,
} from '../../../../controllers/receipt.controller';
import { ICustomer } from '../../../../models/customer';
import { IReceipt } from '../../../../models/receipt';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import { getCustomersFn } from '../../../../controllers/customer.controller';
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

const schema = z.object({
  customerId: z.string().optional().default(''),
  amount: z.string().optional().default(''),
  note: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

export interface EditReceiptProps {
  receiptId: string | number;
}

const EditReceipt: React.FC<EditReceiptProps> = ({
  receiptId,
}: EditReceiptProps) => {
  const [customers, setCustomers] = useState<ICustomer[]>([] as ICustomer[]);
  const { closeSideContent } = useSidebarContext();

  const { register, handleSubmit, control, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const getSingleReceipt = getSingleReceiptFn(receiptId);
      const getCustomers = getCustomersFn();
      const [receiptResponse, customersResponse] = await Promise.all([
        getSingleReceipt,
        getCustomers,
      ]);
      const receipt: IReceipt = receiptResponse;
      reset({
        customerId: receipt.customerId ? String(receipt.customerId) : '',
        amount: receipt.amount ? String(receipt.amount) : '',
        note: receipt.note || '',
      });
      setCustomers(customersResponse);
    };
    fetchData();
  }, [receiptId, reset]);

  const onSubmit = async (values: FormValues) => {
    await updateReceiptFn(values, receiptId);
    closeSideContent();
    await getReceiptsFn();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="customerId">Customer</Label>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="amount">Amount Paid</Label>
        <Input
          id="amount"
          placeholder="Amount Paid"
          type="text"
          {...register('amount')}
        />
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
