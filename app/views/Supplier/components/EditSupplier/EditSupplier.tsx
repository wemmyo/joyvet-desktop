import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useSidebarContext } from '../../../../contexts/SidebarContext';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';
import {
  getSingleSupplierFn,
  deleteSupplierFn,
  updateSupplierFn,
} from '../../../../controllers/supplier.controller';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

const schema = z.object({
  fullName: z.string().min(1, 'Required'),
  address: z.string().optional().default(''),
  phoneNumber: z.string().optional().default(''),
  balance: z.coerce.number().optional().default(0),
});

type FormValues = z.infer<typeof schema>;

export interface EditSupplierProps {
  supplierId: number;
  onRefresh?: () => void;
}

const EditSupplier: React.FC<EditSupplierProps> = ({
  supplierId,
  onRefresh,
}: EditSupplierProps) => {
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
      const response = await getSingleSupplierFn(supplierId);
      if (!response) return;
      reset({
        fullName: response.fullName || '',
        address: response.address || '',
        phoneNumber: response.phoneNumber || '',
        balance: response.balance || 0,
      });
    };
    fetchData();
  }, [supplierId, reset]);

  const handleDeleteSupplier = async () => {
    try {
      await deleteSupplierFn(supplierId);
      toast.success('Supplier deleted');
      closeSideContent();
      onRefresh?.();
    } catch {
      toast.error('Failed to delete supplier');
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateSupplierFn(
        { ...values, balance: Number(values.balance) },
        supplierId
      );
      toast.success('Supplier updated');
      closeSideContent();
      onRefresh?.();
    } catch {
      toast.error('Failed to update supplier');
    }
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
          disabled={!isAdmin()}
        />
        {errors.balance && (
          <span className="text-sm text-destructive">
            {errors.balance.message}
          </span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" variant="default">
          Update
        </Button>
        {isAdmin() ? (
          <Button
            onClick={handleDeleteSupplier}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link to={`${routes.SUPPLIER}/${supplierId}`}>History</Link>
        </Button>
      </div>
    </form>
  );
};
export default EditSupplier;
