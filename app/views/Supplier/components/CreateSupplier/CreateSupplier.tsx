import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

const schema = z.object({
  fullName: z.string().min(1, 'Required'),
  address: z.string().optional().default(''),
  phoneNumber: z.string().optional().default(''),
  balance: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

export interface CreateSupplierProps {
  createSupplierFn: (values: any) => void;
}

const CreateSupplier: React.FC<CreateSupplierProps> = ({
  createSupplierFn,
}: CreateSupplierProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      address: '',
      phoneNumber: '',
      balance: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createSupplierFn(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Full Name"
          type="text"
          {...register('fullName')}
        />
        {errors.fullName && (
          <span className="text-sm text-destructive">
            {errors.fullName.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Address"
          type="text"
          {...register('address')}
        />
        {errors.address && (
          <span className="text-sm text-destructive">
            {errors.address.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          placeholder="Phone Number"
          type="tel"
          {...register('phoneNumber')}
        />
        {errors.phoneNumber && (
          <span className="text-sm text-destructive">
            {errors.phoneNumber.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="balance">Balance</Label>
        <Input
          id="balance"
          placeholder="Balance"
          type="number"
          {...register('balance')}
        />
        {errors.balance && (
          <span className="text-sm text-destructive">
            {errors.balance.message}
          </span>
        )}
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
};
export default CreateSupplier;
