import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { BrowserWindow, app, dialog, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import MenuBuilder from '../menu';
import { registerAuthHandlers } from './ipc/auth.handlers';
import { ensureAppReady } from './runtime';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    void autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      log.error('Automatic update check failed', error);
    });
  }
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    try {
      const installer = require('electron-devtools-installer');
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
      await Promise.all(
        extensions.map((name) =>
          installer.default(installer[name], forceDownload)
        )
      ).catch(console.log);
    } catch (e) {
      console.log('DevTools extension error:', e);
    }
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (
    process.env.NODE_ENV === 'development' &&
    process.env.ELECTRON_RENDERER_URL
  ) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(async () => {
  registerAuthHandlers();

  // Location of the file that stores the chosen SQLite DB path. Must match the
  // path read by checkForDB() in app/utils/database.ts.
  const dbPointerPath = path.join(app.getPath('userData'), 'pathToDB');

  ipcMain.handle('database:getPath', () => {
    try {
      if (fs.existsSync(dbPointerPath)) {
        return fs.readFileSync(dbPointerPath, 'utf8');
      }
    } catch (error) {
      log.error('Failed to read database path', error);
    }
    return '';
  });

  ipcMain.handle('database:changeFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db', 'sqlite', 'sql'] }],
    });

    const selectedPath = result.filePaths[0];
    if (result.canceled || !selectedPath) {
      return { changed: false };
    }

    fs.writeFileSync(dbPointerPath, selectedPath);

    // Relaunch so the singleton Sequelize instance re-initialises against the
    // new database. Defer so this IPC response reaches the renderer first.
    setTimeout(() => {
      app.relaunch();
      app.exit(0);
    }, 0);

    return { changed: true, path: selectedPath };
  });

  // --- Database backup ---------------------------------------------------
  // Admin-configurable folder + manual "Backup now" with last-7 rotation.
  const backupConfigPath = path.join(
    app.getPath('userData'),
    'backupConfig.json'
  );
  const BACKUP_RETENTION = 7;
  const BACKUP_PREFIX = 'joyvet-backup-';

  const readBackupConfig = (): { location: string } => {
    try {
      if (fs.existsSync(backupConfigPath)) {
        const parsed = JSON.parse(fs.readFileSync(backupConfigPath, 'utf8'));
        if (parsed && typeof parsed.location === 'string') {
          return { location: parsed.location };
        }
      }
    } catch (error) {
      log.error('Failed to read backup config', error);
    }
    return { location: '' };
  };

  // Backup filenames are timestamped so they sort chronologically (oldest first).
  const listBackups = (location: string): string[] => {
    try {
      return fs
        .readdirSync(location)
        .filter(
          (name) => name.startsWith(BACKUP_PREFIX) && name.endsWith('.db')
        )
        .sort();
    } catch {
      return [];
    }
  };

  ipcMain.handle('backup:getConfig', () => {
    const { location } = readBackupConfig();
    let lastBackupAt: string | null = null;
    if (location) {
      const backups = listBackups(location);
      const latest = backups[backups.length - 1];
      if (latest) {
        try {
          lastBackupAt = fs
            .statSync(path.join(location, latest))
            .mtime.toISOString();
        } catch {
          // ignore unreadable file
        }
      }
    }
    return { location, lastBackupAt };
  });

  ipcMain.handle('backup:chooseLocation', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });
    const selected = result.filePaths[0];
    if (result.canceled || !selected) {
      return { changed: false };
    }
    fs.writeFileSync(backupConfigPath, JSON.stringify({ location: selected }));
    return { changed: true, location: selected };
  });

  ipcMain.handle('backup:now', () => {
    const { location } = readBackupConfig();
    if (!location) {
      throw new Error('No backup location set. Please choose a folder first.');
    }
    try {
      fs.accessSync(location, fs.constants.W_OK);
    } catch {
      throw new Error(
        'Backup location is not writable. Please choose another folder.'
      );
    }

    const dbPath = fs.existsSync(dbPointerPath)
      ? fs.readFileSync(dbPointerPath, 'utf8').trim()
      : '';
    if (!dbPath || !fs.existsSync(dbPath)) {
      throw new Error('Database file not found.');
    }

    const timestamp = dayjs().format('YYYY-MM-DD-HHmmss');
    const destination = path.join(location, `${BACKUP_PREFIX}${timestamp}.db`);
    fs.copyFileSync(dbPath, destination);

    // Rotate: keep only the newest BACKUP_RETENTION backups.
    const backups = listBackups(location);
    if (backups.length > BACKUP_RETENTION) {
      for (const name of backups.slice(0, backups.length - BACKUP_RETENTION)) {
        try {
          fs.unlinkSync(path.join(location, name));
        } catch (error) {
          log.error('Failed to delete old backup', error);
        }
      }
    }

    return { path: destination, backedUpAt: new Date().toISOString() };
  });

  ipcMain.handle('backup:restore', async () => {
    const dbPath = fs.existsSync(dbPointerPath)
      ? fs.readFileSync(dbPointerPath, 'utf8').trim()
      : '';
    if (!dbPath) {
      throw new Error('Database location is unknown.');
    }

    const { location } = readBackupConfig();
    const picked = await dialog.showOpenDialog({
      properties: ['openFile'],
      defaultPath: location || undefined,
      filters: [{ name: 'Backup', extensions: ['db', 'sqlite', 'sql'] }],
    });
    const selected = picked.filePaths[0];
    if (picked.canceled || !selected) {
      return { restored: false };
    }
    if (!fs.existsSync(selected)) {
      throw new Error('Selected backup file not found.');
    }

    const confirm = await dialog.showMessageBox({
      type: 'warning',
      buttons: ['Cancel', 'Restore'],
      defaultId: 0,
      cancelId: 0,
      title: 'Restore database',
      message: 'Restore from this backup?',
      detail:
        'This replaces your current database with the selected backup and ' +
        'restarts the app. Your current database is first saved as a ' +
        '".pre-restore" copy so this can be undone.',
    });
    if (confirm.response !== 1) {
      return { restored: false };
    }

    // Safety: snapshot the current DB before overwriting so a wrong restore
    // can be recovered manually.
    try {
      if (fs.existsSync(dbPath)) {
        const stamp = dayjs().format('YYYY-MM-DD-HHmmss');
        fs.copyFileSync(dbPath, `${dbPath}.pre-restore-${stamp}`);
      }
    } catch (error) {
      log.error('Failed to snapshot current DB before restore', error);
    }

    fs.copyFileSync(selected, dbPath);

    // Remove stale WAL/journal sidecars belonging to the OLD database — left in
    // place they would be replayed onto the restored file and corrupt it.
    for (const suffix of ['-wal', '-shm', '-journal']) {
      try {
        if (fs.existsSync(`${dbPath}${suffix}`)) {
          fs.unlinkSync(`${dbPath}${suffix}`);
        }
      } catch (error) {
        log.error(`Failed to remove ${suffix} sidecar`, error);
      }
    }

    // Relaunch so the singleton Sequelize instance reopens the restored file.
    setTimeout(() => {
      app.relaunch();
      app.exit(0);
    }, 0);

    return { restored: true };
  });

  // Register every renderer-facing handler before creating the window. The
  // renderer starts requesting data as soon as it loads, so registering these
  // handlers in a detached task after createWindow introduces a startup race.
  try {
    const { registerInvoiceHandlers } = await import('./ipc/invoice.handlers');
    const { registerCustomerHandlers } = await import(
      './ipc/customer.handlers'
    );
    const { registerProductHandlers } = await import('./ipc/product.handlers');
    const { registerUserHandlers } = await import('./ipc/user.handlers');
    const { registerSupplierHandlers } = await import(
      './ipc/supplier.handlers'
    );
    const { registerPurchaseHandlers } = await import(
      './ipc/purchase.handlers'
    );
    const { registerPaymentHandlers } = await import('./ipc/payment.handlers');
    const { registerReceiptHandlers } = await import('./ipc/receipt.handlers');
    const { registerExpenseHandlers } = await import('./ipc/expense.handlers');
    const { registerStoreInfoHandlers } = await import(
      './ipc/storeInfo.handlers'
    );
    const { registerAnalyticsHandlers } = await import(
      './ipc/analytics.handlers'
    );

    registerInvoiceHandlers();
    registerCustomerHandlers();
    registerProductHandlers();
    registerUserHandlers();
    registerSupplierHandlers();
    registerPurchaseHandlers();
    registerPaymentHandlers();
    registerReceiptHandlers();
    registerExpenseHandlers();
    registerStoreInfoHandlers();
    registerAnalyticsHandlers();
  } catch (error) {
    log.error('IPC handler registration failed', error);
    app.quit();
    return;
  }

  await createWindow();

  mainWindow?.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      // eslint-disable-next-line no-new
      new AppUpdater();
    }, 0);
  });

  void ensureAppReady().catch((error) => {
    log.error('App initialization failed', error);
  });

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});
