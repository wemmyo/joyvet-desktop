import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IStoreInfo } from '../../../../models/storeInfo';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

const schema = z.object({
  storeName: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  phoneNumber: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

export interface CreateStoreInfoProps {
  createStoreInfoFn: (values: Partial<IStoreInfo>) => void;
}

const CreateStoreInfo: React.FC<CreateStoreInfoProps> = ({
  createStoreInfoFn,
}: CreateStoreInfoProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      storeName: '',
      address: '',
      phoneNumber: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createStoreInfoFn(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="storeName">Store name</Label>
        <Input
          id="storeName"
          placeholder="Store name"
          type="text"
          {...register('storeName')}
        />
        {errors.storeName && (
          <span className="text-sm text-destructive">
            {errors.storeName.message}
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
        <Label htmlFor="phoneNumber">Phone number</Label>
        <Input
          id="phoneNumber"
          placeholder="Phone number"
          type="text"
          {...register('phoneNumber')}
        />
        {errors.phoneNumber && (
          <span className="text-sm text-destructive">
            {errors.phoneNumber.message}
          </span>
        )}
      </div>
      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
};
export default CreateStoreInfo;
