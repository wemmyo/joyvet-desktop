import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect } from 'react';
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
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  deleteExpenseFn,
  getSingleExpenseFn,
  updateExpenseFn,
} from '../../../../controllers/expense.controller';
import type { IExpense } from '../../../../models/expense';

const schema = z.object({
  type: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  note: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

export interface EditExpenseProps {
  expenseId: number;
  refreshExpenses: () => void;
}

const EditExpense: React.FC<EditExpenseProps> = ({
  expenseId,
  refreshExpenses,
}: EditExpenseProps) => {
  const { closeSideContent } = useSidebarContext();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleExpenseFn(expenseId);
      if (!response) return;
      const expense: IExpense = response;
      reset({
        type: expense.type || '',
        amount: expense.amount ? String(expense.amount) : '',
        date: dayjs(expense.date).format('YYYY-MM-DD') || '',
        note: expense.note || '',
      });
    };
    fetchData();
  }, [expenseId, reset]);

  const onSuccess = () => {
    refreshExpenses();
    closeSideContent();
  };

  const handleDeleteExpense = async () => {
    await deleteExpenseFn(expenseId, onSuccess);
  };

  const onSubmit = async (values: FormValues) => {
    await updateExpenseFn(
      {
        ...values,
        amount: Number(values.amount),
        date: new Date(values.date || ''),
      },
      Number(expenseId),
      onSuccess
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="type">Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
          step="any"
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
        <Input id="note" placeholder="Note" type="text" {...register('note')} />
      </div>

      <Button type="submit" className="w-full">
        Update
      </Button>
      <Button
        className="w-full mt-2"
        onClick={handleDeleteExpense}
        type="button"
        variant="destructive"
      >
        Delete
      </Button>
    </form>
  );
};
export default EditExpense;
