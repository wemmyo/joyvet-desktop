import { zodResolver } from '@hookform/resolvers/zod';
import type * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
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

const schema = z.object({
  type: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  note: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

export interface CreateExpenseProps {
  createExpenseFn: (values: any) => Promise<void>;
}

const CreateExpense: React.FC<CreateExpenseProps> = ({
  createExpenseFn,
}: CreateExpenseProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: '',
      amount: '',
      date: '',
      note: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createExpenseFn(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="type">Sale Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advertisement">advertisement</SelectItem>
                <SelectItem value="bank charges & cto">
                  bank charges &amp; cto
                </SelectItem>
                <SelectItem value="diesel & fuel">diesel &amp; fuel</SelectItem>
                <SelectItem value="generator maintenance">
                  generator maintenance
                </SelectItem>
                <SelectItem value="miscellaneous">miscellaneous</SelectItem>
                <SelectItem value="office">office</SelectItem>
                <SelectItem value="pr/gifts">pr/gifts</SelectItem>
                <SelectItem value="printing & stationary">
                  printing &amp; stationary
                </SelectItem>
                <SelectItem value="rent">rent</SelectItem>
                <SelectItem value="telephone">telephone</SelectItem>
                <SelectItem value="training">training</SelectItem>
                <SelectItem value="transport">transport</SelectItem>
                <SelectItem value="salary">salary</SelectItem>
                <SelectItem value="staff bonus">staff bonus</SelectItem>
                <SelectItem value="vehicle maintenance">
                  vehicle maintenance
                </SelectItem>
                <SelectItem value="vehicle fuel">vehicle fuel</SelectItem>
                <SelectItem value="water & gas">water &amp; gas</SelectItem>
                <SelectItem value="others">others</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          placeholder="Amount"
          type="number"
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
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          placeholder="Date"
          type="date"
          {...register('date')}
          className={errors.date ? 'border-destructive' : ''}
        />
        {errors.date && (
          <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="note">Note</Label>
        <Input
          id="note"
          placeholder="Note"
          type="text"
          {...register('note')}
          className={errors.note ? 'border-destructive' : ''}
        />
        {errors.note && (
          <p className="text-sm text-destructive mt-1">{errors.note.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
};
export default CreateExpense;
