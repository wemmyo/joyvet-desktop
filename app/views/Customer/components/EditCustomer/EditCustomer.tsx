import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { useSidebarContext } from '../../../../contexts/SidebarContext';
import {
  deleteCustomerFn,
  getSingleCustomerFn,
  updateCustomerFn,
} from '../../../../controllers/customer.controller';
import type { ICustomer } from '../../../../models/customer';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';

const schema = z.object({
  fullName: z.string().min(1, 'Required'),
  address: z.string().optional().default(''),
  phoneNumber: z.string().optional().default(''),
  balance: z.coerce.number().optional().default(0),
  maxPriceLevel: z.coerce.number().optional().default(0),
});

type FormValues = z.infer<typeof schema>;

export interface EditCustomerProps {
  customerId: number;
  onRefresh?: () => void;
}

const EditCustomer: React.FC<EditCustomerProps> = ({
  customerId,
  onRefresh,
}: EditCustomerProps) => {
  const [customer, setCustomer] = useState<ICustomer>({} as ICustomer);

  const { closeSideContent } = useSidebarContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleCustomerFn(Number(customerId));
      if (!response) return;
      setCustomer(response);
      reset({
        fullName: response.fullName || '',
        address: response.address || '',
        phoneNumber: response.phoneNumber || '',
        balance: response.balance || 0,
        maxPriceLevel: response.maxPriceLevel || 0,
      });
    };

    fetchData();
  }, [customerId, reset]);

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomerFn(Number(customerId));
      toast.success('Customer deleted');
      closeSideContent();
      onRefresh?.();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateCustomerFn(
        {
          ...values,
          balance: Number(values.balance),
          maxPriceLevel: Number(values.maxPriceLevel),
        },
        customerId
      );
      toast.success('Customer updated');
      closeSideContent();
      onRefresh?.();
    } catch {
      toast.error('Failed to update customer');
    }
  };

  return (
    <>
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
            disabled={!isAdmin()}
          />
          {errors.balance && (
            <span className="text-sm text-destructive">
              {errors.balance.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="maxPriceLevel">Max Price Level</Label>
          <Input
            id="maxPriceLevel"
            placeholder="Max Price Level"
            type="number"
            {...register('maxPriceLevel')}
            disabled={!isAdmin()}
          />
          {errors.maxPriceLevel && (
            <span className="text-sm text-destructive">
              {errors.maxPriceLevel.message}
            </span>
          )}
        </div>
      </form>
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          variant="default"
        >
          Update
        </Button>
        {isAdmin() ? (
          <Button
            onClick={handleDeleteCustomer}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link to={`${routes.CUSTOMER}/${customerId}`}>History</Link>
        </Button>
      </div>
    </>
  );
};
export default EditCustomer;
