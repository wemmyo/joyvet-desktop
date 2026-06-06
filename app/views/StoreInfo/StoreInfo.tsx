import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  createStoreInfoFn,
  getStoreInfoFn,
  updateStoreInfoFn,
} from '../../controllers/storeInfo.controller';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import type { IStoreInfo } from '../../models/storeInfo';
import routes from '../../routing/routes';
import { isAdmin } from '../../utils/helpers';

const schema = z.object({
  storeName: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  phoneNumber: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

const StoreInfoScreen: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<IStoreInfo | undefined>();
  const [dbPath, setDbPath] = useState('');
  const [backupLocation, setBackupLocation] = useState('');
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
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
    window.api.database
      .getPath()
      .then((p) => setDbPath(p ?? ''))
      .catch(() => {});
  }, []);

  const refreshBackupConfig = () => {
    window.api.backup
      .getConfig()
      .then((config) => {
        setBackupLocation(config.location ?? '');
        setLastBackupAt(config.lastBackupAt ?? null);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshBackupConfig();
  }, []);

  const handleChangeDatabase = async () => {
    try {
      const result = await window.api.database.changeFile();
      if (result.changed) {
        toast.success('Database updated. Restarting the app…');
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to change database'
      );
    }
  };

  const handleChooseBackupFolder = async () => {
    try {
      const result = await window.api.backup.chooseLocation();
      if (result.changed) {
        setBackupLocation(result.location ?? '');
        toast.success('Backup folder updated');
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to set backup folder'
      );
    }
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      await window.api.backup.now();
      toast.success('Backup created');
      refreshBackupConfig();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create backup'
      );
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const result = await window.api.backup.restore();
      if (result.restored) {
        toast.success('Database restored. Restarting the app…');
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to restore backup'
      );
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: getStoreInfoFn and reset are stable
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

        <div className="mt-8 border-t pt-6 flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Database</h2>
          <div className="flex flex-col gap-1">
            <Label htmlFor="dbPath">Current database file</Label>
            <Input
              id="dbPath"
              type="text"
              readOnly
              value={dbPath || 'Not set'}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a different database file (e.g. from Downloads). The app will
            restart to load the selected database.
          </p>
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={handleChangeDatabase}
          >
            Change Database File
          </Button>
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Backup</h2>
          <div className="flex flex-col gap-1">
            <Label htmlFor="backupLocation">Backup folder</Label>
            <Input
              id="backupLocation"
              type="text"
              readOnly
              value={backupLocation || 'Not set'}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Last backup:{' '}
            {lastBackupAt
              ? dayjs(lastBackupAt).format('DD/MM/YYYY h:mm a')
              : 'Never'}
          </p>
          <p className="text-sm text-muted-foreground">
            Backups are copied to the selected folder. Only the 7 most recent
            backups are kept.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleChooseBackupFolder}
            >
              Change folder
            </Button>
            <Button
              type="button"
              onClick={handleBackupNow}
              disabled={isBackingUp || !backupLocation}
            >
              {isBackingUp ? 'Backing up…' : 'Backup now'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRestoreBackup}
            >
              Restore from backup
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Restoring replaces the current database with a chosen backup file
            and restarts the app. The current database is saved as a
            “.pre-restore” copy first.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StoreInfoScreen;
