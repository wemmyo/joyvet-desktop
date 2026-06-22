import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

const BackupScreen: React.FC = () => {
  const [backupLocation, setBackupLocation] = useState('');
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

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
    setIsRestoring(true);
    try {
      const result = await window.api.backup.restore();
      if (result.restored) {
        toast.success('Database restored. Restarting the app…');
      }
      setRestoreDialogOpen(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to restore backup'
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <DashboardLayout screenTitle="Backup">
      <div className="max-w-md">
        <div className="flex flex-col gap-2">
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
              onClick={() => setRestoreDialogOpen(true)}
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

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore from a backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces the current database with a backup file you choose
              and restarts the app. Any changes made since that backup will be
              lost. The current database is saved as a “.pre-restore” copy first,
              so this can be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRestoring}
              onClick={(event) => {
                // Keep the dialog open while the file picker + restore run;
                // it closes itself on success.
                event.preventDefault();
                handleRestoreBackup();
              }}
            >
              {isRestoring ? 'Restoring…' : 'Choose file & restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default BackupScreen;
