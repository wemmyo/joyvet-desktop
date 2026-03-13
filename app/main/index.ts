import path from 'path';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from '../menu';
import bcrypt from 'bcryptjs';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    try {
      const installer = require('electron-devtools-installer');
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
      const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
      await Promise.all(
        extensions.map((name) => installer.default(installer[name], forceDownload))
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
      sandbox: false,
    },
  });

  if (process.env.NODE_ENV === 'development' && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
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

  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(async () => {
  // All database-dependent imports are deferred here so dialog/app are ready
  const { default: database } = await import('./database');

  // Models (imported after db is ready so sequelize.define() works)
  const Customer = (await import('../models/customer')).default;
  const Invoice = (await import('../models/invoice')).default;
  const Payment = (await import('../models/payment')).default;
  const Product = (await import('../models/product')).default;
  const Purchase = (await import('../models/purchase')).default;
  const Receipt = (await import('../models/receipt')).default;
  const Supplier = (await import('../models/supplier')).default;
  const InvoiceItem = (await import('../models/invoiceItem')).default;
  const PurchaseItem = (await import('../models/purchaseItem')).default;
  const User = (await import('../models/user')).default;

  // Associations
  Invoice.belongsToMany(Product, { through: InvoiceItem });
  Product.belongsToMany(Invoice, { through: InvoiceItem });
  Customer.hasMany(Invoice);
  Invoice.belongsTo(Customer);
  Receipt.belongsTo(Customer);
  Customer.hasMany(Receipt);
  Payment.belongsTo(Supplier);
  Supplier.hasMany(Payment);
  Purchase.belongsTo(Supplier);
  Supplier.hasMany(Purchase);
  Purchase.belongsToMany(Product, { through: PurchaseItem });
  Product.belongsToMany(Purchase, { through: PurchaseItem });

  await database.sync();

  // Seed default admin
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin', 12);
    await User.create({
      fullName: 'admin',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });
  }

  // Register IPC handlers (after models/db are ready)
  const { registerInvoiceHandlers } = await import('./ipc/invoice.handlers');
  const { registerCustomerHandlers } = await import('./ipc/customer.handlers');
  const { registerProductHandlers } = await import('./ipc/product.handlers');
  const { registerUserHandlers } = await import('./ipc/user.handlers');
  const { registerSupplierHandlers } = await import('./ipc/supplier.handlers');
  const { registerPurchaseHandlers } = await import('./ipc/purchase.handlers');
  const { registerPaymentHandlers } = await import('./ipc/payment.handlers');
  const { registerReceiptHandlers } = await import('./ipc/receipt.handlers');
  const { registerExpenseHandlers } = await import('./ipc/expense.handlers');
  const { registerStoreInfoHandlers } = await import('./ipc/storeInfo.handlers');

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

  ipcMain.handle('dialog:selectDbPath', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db', 'sqlite', 'sql'] }],
    });
    return result.filePaths[0];
  });

  await createWindow();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});
