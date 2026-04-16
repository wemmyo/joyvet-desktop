"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const path = require("node:path");
const electron = require("electron");
const log = require("electron-log");
const electronUpdater = require("electron-updater");
const zod = require("zod");
const bcryptjs = require("bcryptjs");
class MenuBuilder {
  constructor(mainWindow2) {
    this.mainWindow = mainWindow2;
  }
  buildMenu() {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true") {
      this.setupDevelopmentEnvironment();
    }
    const template = process.platform === "darwin" ? this.buildDarwinTemplate() : this.buildDefaultTemplate();
    const menu = electron.Menu.buildFromTemplate(template);
    electron.Menu.setApplicationMenu(menu);
    return menu;
  }
  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.on("context-menu", (_, props) => {
      const { x, y } = props;
      electron.Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          }
        }
      ]).popup({ window: this.mainWindow });
    });
  }
  buildDarwinTemplate() {
    const subMenuAbout = {
      label: "Electron",
      submenu: [
        {
          label: "About ElectronReact",
          selector: "orderFrontStandardAboutPanel:"
        },
        { type: "separator" },
        { label: "Services", submenu: [] },
        { type: "separator" },
        {
          label: "Hide ElectronReact",
          accelerator: "Command+H",
          selector: "hide:"
        },
        {
          label: "Hide Others",
          accelerator: "Command+Shift+H",
          selector: "hideOtherApplications:"
        },
        { label: "Show All", selector: "unhideAllApplications:" },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            electron.app.quit();
          }
        }
      ]
    };
    const subMenuEdit = {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "Command+X", selector: "cut:" },
        { label: "Copy", accelerator: "Command+C", selector: "copy:" },
        { label: "Paste", accelerator: "Command+V", selector: "paste:" },
        {
          label: "Select All",
          accelerator: "Command+A",
          selector: "selectAll:"
        }
      ]
    };
    const subMenuViewDev = {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "Command+R",
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: "Toggle Full Screen",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "Alt+Command+I",
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: "View",
      submenu: [
        {
          label: "Toggle Full Screen",
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuWindow = {
      label: "Window",
      submenu: [
        {
          label: "Minimize",
          accelerator: "Command+M",
          selector: "performMiniaturize:"
        },
        { label: "Close", accelerator: "Command+W", selector: "performClose:" },
        { type: "separator" },
        { label: "Bring All to Front", selector: "arrangeInFront:" }
      ]
    };
    const subMenuHelp = {
      label: "Help",
      submenu: [
        {
          label: "Learn More",
          click() {
            electron.shell.openExternal("https://electronjs.org");
          }
        },
        {
          label: "Documentation",
          click() {
            electron.shell.openExternal(
              "https://github.com/electron/electron/tree/master/docs#readme"
            );
          }
        },
        {
          label: "Community Discussions",
          click() {
            electron.shell.openExternal("https://www.electronjs.org/community");
          }
        },
        {
          label: "Search Issues",
          click() {
            electron.shell.openExternal("https://github.com/electron/electron/issues");
          }
        }
      ]
    };
    const subMenuView = process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true" ? subMenuViewDev : subMenuViewProd;
    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }
  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: "&File",
        submenu: [
          {
            label: "&Open",
            accelerator: "Ctrl+O"
          },
          {
            label: "&Close",
            accelerator: "Ctrl+W",
            click: () => {
              this.mainWindow.close();
            }
          }
        ]
      },
      {
        label: "&View",
        submenu: process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true" ? [
          {
            label: "&Reload",
            accelerator: "Ctrl+R",
            click: () => {
              this.mainWindow.webContents.reload();
            }
          },
          {
            label: "Toggle &Full Screen",
            accelerator: "F11",
            click: () => {
              this.mainWindow.setFullScreen(
                !this.mainWindow.isFullScreen()
              );
            }
          },
          {
            label: "Toggle &Developer Tools",
            accelerator: "Alt+Ctrl+I",
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            }
          }
        ] : [
          {
            label: "Toggle &Full Screen",
            accelerator: "F11",
            click: () => {
              this.mainWindow.setFullScreen(
                !this.mainWindow.isFullScreen()
              );
            }
          }
        ]
      },
      {
        label: "Help",
        submenu: [
          {
            label: "Learn More",
            click() {
              electron.shell.openExternal("https://electronjs.org");
            }
          },
          {
            label: "Documentation",
            click() {
              electron.shell.openExternal(
                "https://github.com/electron/electron/tree/master/docs#readme"
              );
            }
          },
          {
            label: "Community Discussions",
            click() {
              electron.shell.openExternal("https://www.electronjs.org/community");
            }
          },
          {
            label: "Search Issues",
            click() {
              electron.shell.openExternal("https://github.com/electron/electron/issues");
            }
          }
        ]
      }
    ];
    return templateDefault;
  }
}
const isObject = (value) => {
  return typeof value === "object" && value !== null;
};
const sanitizeUserSession = (value) => {
  if (!isObject(value)) {
    return null;
  }
  const { id, fullName, role } = value;
  if (typeof id !== "number" || Number.isNaN(id) || typeof fullName !== "string" || fullName.trim() === "" || typeof role !== "string" || role.trim() === "") {
    return null;
  }
  return {
    id,
    fullName,
    role
  };
};
const hasUsers = async (UserModel) => {
  return await UserModel.count() > 0;
};
const maybeSeedDevelopmentAdmin = async (UserModel, isDevelopment = process.env.NODE_ENV === "development") => {
  if (!isDevelopment || process.env.SEED_DEV_ADMIN !== "true") {
    return false;
  }
  const admin = await UserModel.findOne({ where: { role: "admin" } });
  if (admin) {
    return false;
  }
  const hashedPassword = await bcryptjs.hash("admin", 12);
  await UserModel.create({
    fullName: "admin",
    username: "admin",
    password: hashedPassword,
    role: "admin"
  });
  return true;
};
const createInitialAdmin = async (UserModel, values) => {
  if (await hasUsers(UserModel)) {
    throw new Error("Initial admin has already been configured");
  }
  const hashedPassword = await bcryptjs.hash(values.password, 12);
  return UserModel.create({
    fullName: values.fullName,
    username: values.username,
    password: hashedPassword,
    role: "admin"
  });
};
let authReadyPromise = null;
let appReadyPromise = null;
let associationsRegistered = false;
const loadAuthModel = async () => {
  return {
    User: (await Promise.resolve().then(() => require("./chunks/user-41TqnyQo.js"))).default
  };
};
const loadCoreModels = async () => {
  const { default: database } = await Promise.resolve().then(() => require("./chunks/database-B2-sKH-W.js"));
  return {
    database,
    Customer: (await Promise.resolve().then(() => require("./chunks/customer-AFNQVMiH.js"))).default,
    Invoice: (await Promise.resolve().then(() => require("./chunks/invoice-BYTXWifx.js"))).default,
    Payment: (await Promise.resolve().then(() => require("./chunks/payment-BuFo9FFV.js"))).default,
    Product: (await Promise.resolve().then(() => require("./chunks/product-BJuxFmL1.js"))).default,
    Purchase: (await Promise.resolve().then(() => require("./chunks/purchase-QE33x8C-.js"))).default,
    Receipt: (await Promise.resolve().then(() => require("./chunks/receipt-CTqobXuf.js"))).default,
    Supplier: (await Promise.resolve().then(() => require("./chunks/supplier-B7BVPKt0.js"))).default,
    InvoiceItem: (await Promise.resolve().then(() => require("./chunks/invoiceItem-ugKan7Tk.js"))).default,
    PurchaseItem: (await Promise.resolve().then(() => require("./chunks/purchaseItem-E_USOj9M.js"))).default,
    User: (await Promise.resolve().then(() => require("./chunks/user-41TqnyQo.js"))).default,
    ProductAuditLog: (await Promise.resolve().then(() => require("./chunks/productAuditLog-COWZ8vwR.js"))).default,
    InvoiceAuditLog: (await Promise.resolve().then(() => require("./chunks/invoiceAuditLog-BSSafPmP.js"))).default,
    StoreInfo: (await Promise.resolve().then(() => require("./chunks/storeInfo-BcHWGcYe.js"))).default,
    Expense: (await Promise.resolve().then(() => require("./chunks/expense-CvncM4g_.js"))).default,
    ExpenseType: (await Promise.resolve().then(() => require("./chunks/expenseType-kStOuDkq.js"))).default
  };
};
const registerAssociations = (models) => {
  if (associationsRegistered) {
    return;
  }
  const {
    Customer,
    Invoice,
    InvoiceItem,
    Payment,
    Product,
    Purchase,
    PurchaseItem,
    Receipt,
    Supplier,
    ProductAuditLog,
    InvoiceAuditLog
  } = models;
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
  Product.hasMany(ProductAuditLog, { foreignKey: "productId" });
  ProductAuditLog.belongsTo(Product, { foreignKey: "productId" });
  Invoice.hasMany(InvoiceAuditLog, { foreignKey: "invoiceId" });
  InvoiceAuditLog.belongsTo(Invoice, { foreignKey: "invoiceId" });
  associationsRegistered = true;
};
const ensureAuthReady = async () => {
  if (!authReadyPromise) {
    authReadyPromise = (async () => {
      const { User } = await loadAuthModel();
      await User.sync();
      return { User };
    })();
  }
  return authReadyPromise;
};
const ensureAppReady = async () => {
  if (!appReadyPromise) {
    appReadyPromise = (async () => {
      const models = await loadCoreModels();
      registerAssociations(models);
      await models.database.sync();
      await maybeSeedDevelopmentAdmin(models.User);
    })();
  }
  return appReadyPromise;
};
const withAppReady = (handler) => {
  return async (...args) => {
    await ensureAppReady();
    return handler(...args);
  };
};
const initialAdminSchema = zod.z.object({
  fullName: zod.z.string().min(3).max(255),
  username: zod.z.string().min(3).max(255),
  password: zod.z.string().min(8).max(255)
});
function registerAuthHandlers() {
  electron.ipcMain.handle("auth:getBootstrapStatus", async () => {
    const { User } = await ensureAuthReady();
    return {
      hasUsers: await hasUsers(User)
    };
  });
  electron.ipcMain.handle("auth:createInitialAdmin", async (_event, values) => {
    const { User } = await ensureAuthReady();
    const parsedValues = initialAdminSchema.parse(values);
    const user = await createInitialAdmin(User, parsedValues);
    const session = sanitizeUserSession(
      user?.toJSON ? user.toJSON() : user
    );
    if (!session) {
      throw new Error("Invalid user session");
    }
    return session;
  });
}
class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    electronUpdater.autoUpdater.logger = log;
    electronUpdater.autoUpdater.checkForUpdatesAndNotify();
  }
}
let mainWindow = null;
const createWindow = async () => {
  if (process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true") {
    try {
      const installer = require("electron-devtools-installer");
      const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
      const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
      await Promise.all(
        extensions.map(
          (name) => installer.default(installer[name], forceDownload)
        )
      ).catch(console.log);
    } catch (e) {
      console.log("DevTools extension error:", e);
    }
  }
  mainWindow = new electron.BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  if (process.env.NODE_ENV === "development" && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.whenReady().then(async () => {
  registerAuthHandlers();
  electron.ipcMain.handle("dialog:selectDbPath", async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Database", extensions: ["db", "sqlite", "sql"] }]
    });
    return result.filePaths[0];
  });
  await createWindow();
  mainWindow?.webContents.once("did-finish-load", () => {
    setTimeout(() => {
      new AppUpdater();
    }, 0);
  });
  void (async () => {
    const { registerInvoiceHandlers } = await Promise.resolve().then(() => require("./chunks/invoice.handlers-D_5fS3Wj.js"));
    const { registerCustomerHandlers } = await Promise.resolve().then(() => require("./chunks/customer.handlers-DGzsfFVO.js"));
    const { registerProductHandlers } = await Promise.resolve().then(() => require("./chunks/product.handlers-3o5mYiku.js"));
    const { registerUserHandlers } = await Promise.resolve().then(() => require("./chunks/user.handlers-DiTE6kme.js"));
    const { registerSupplierHandlers } = await Promise.resolve().then(() => require("./chunks/supplier.handlers-D754k6G0.js"));
    const { registerPurchaseHandlers } = await Promise.resolve().then(() => require("./chunks/purchase.handlers-D78TvkqH.js"));
    const { registerPaymentHandlers } = await Promise.resolve().then(() => require("./chunks/payment.handlers-FCNcdC22.js"));
    const { registerReceiptHandlers } = await Promise.resolve().then(() => require("./chunks/receipt.handlers-Cp2aDBbm.js"));
    const { registerExpenseHandlers } = await Promise.resolve().then(() => require("./chunks/expense.handlers-Cz1izIar.js"));
    const { registerStoreInfoHandlers } = await Promise.resolve().then(() => require("./chunks/storeInfo.handlers-CVNjQwKO.js"));
    const { registerAnalyticsHandlers } = await Promise.resolve().then(() => require("./chunks/analytics.handlers-Dd6rN_33.js"));
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
    log.error("App initialization failed", error);
  });
  electron.app.on("activate", () => {
    if (mainWindow === null) createWindow();
  });
});
exports.ensureAuthReady = ensureAuthReady;
exports.sanitizeUserSession = sanitizeUserSession;
exports.withAppReady = withAppReady;
