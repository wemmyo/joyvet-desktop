import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  getSingleExpenseFn,
  deleteExpenseFn,
  updateExpenseFn,
} from '../../../../controllers/expense.controller';
import { IExpense } from '../../../../models/expense';
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
  type: z.string().optional().default(''),
  amount: z.string().optional().default(''),
  date: z.string().optional().default(''),
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

  const { register, handleSubmit, control, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleExpenseFn(expenseId);
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

  const handleDeleteExpense = async () => {
    await deleteExpenseFn(expenseId);
    refreshExpenses();
    closeSideContent();
  };

  const onSubmit = async (values: FormValues) => {
    await updateExpenseFn(
      {
        ...values,
        amount: Number(values.amount),
        date: new Date(values.date || ''),
      },
      Number(expenseId)
    );
    refreshExpenses();
    closeSideContent();
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
      </div>
      <div className="space-y-1">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          placeholder="Amount"
          type="number"
          {...register('amount')}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="date">Date</Label>
        <Input id="date" placeholder="Date" type="date" {...register('date')} />
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
