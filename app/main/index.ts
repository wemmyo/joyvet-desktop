import path from 'node:path';
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
    autoUpdater.checkForUpdatesAndNotify();
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

  ipcMain.handle('dialog:selectDbPath', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db', 'sqlite', 'sql'] }],
    });
    return result.filePaths[0];
  });

  await createWindow();

  mainWindow?.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      // eslint-disable-next-line no-new
      new AppUpdater();
    }, 0);
  });

  void (async () => {
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

    await ensureAppReady();
  })().catch((error) => {
    log.error('App initialization failed', error);
  });

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});
