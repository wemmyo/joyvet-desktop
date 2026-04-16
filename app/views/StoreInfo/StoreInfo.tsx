import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  createStoreInfoFn,
  getStoreInfoFn,
  updateStoreInfoFn,
} from '../../controllers/storeInfo.controller';
import { IStoreInfo } from '../../models/storeInfo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { isAdmin } from '../../utils/helpers';
import routes from '../../routing/routes';

const schema = z.object({
  storeName: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  phoneNumber: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

const StoreInfoScreen: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<IStoreInfo | undefined>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { storeName: '', address: '', phoneNumber: '' },
  });

  useEffect(() => {
    if (!isAdmin()) navigate(routes.SALES);
  }, [navigate]);

  useEffect(() => {
    getStoreInfoFn()
      .then((records) => {
        const record = records?.[0];
        setStoreInfo(record);
        if (record) {
          reset({
            storeName: record.storeName,
            address: record.address,
            phoneNumber: record.phoneNumber,
          });
        }
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load store info'
        );
      });
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      if (storeInfo?.id) {
        await updateStoreInfoFn(values, storeInfo.id);
        toast.success('Store information updated');
      } else {
        await createStoreInfoFn(values, async () => {
          const records = await getStoreInfoFn();
          setStoreInfo(records?.[0]);
        });
        toast.success('Store information saved');
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save store info'
      );
    }
  };

  return (
    <DashboardLayout screenTitle="Store Information">
      <div className="max-w-md">
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
          <Button type="submit">Save</Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default StoreInfoScreen;
