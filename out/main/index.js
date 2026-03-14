"use strict";
const path = require("path");
const electron = require("electron");
const electronUpdater = require("electron-updater");
const log = require("electron-log");
const bcrypt = require("bcryptjs");
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
      sandbox: false
    }
  });
  if (process.env.NODE_ENV === "development" && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
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
  new AppUpdater();
};
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.whenReady().then(async () => {
  const { default: database } = await Promise.resolve().then(() => require("./chunks/database-Cj22cbL8.js"));
  const Customer = (await Promise.resolve().then(() => require("./chunks/customer-DOw70VuU.js"))).default;
  const Invoice = (await Promise.resolve().then(() => require("./chunks/invoice-Civ-gfB_.js"))).default;
  const Payment = (await Promise.resolve().then(() => require("./chunks/payment-9-9dtC0H.js"))).default;
  const Product = (await Promise.resolve().then(() => require("./chunks/product-D77rVCIx.js"))).default;
  const Purchase = (await Promise.resolve().then(() => require("./chunks/purchase-BlBXNXRZ.js"))).default;
  const Receipt = (await Promise.resolve().then(() => require("./chunks/receipt-CgVNnpBY.js"))).default;
  const Supplier = (await Promise.resolve().then(() => require("./chunks/supplier-CIPjGeuJ.js"))).default;
  const InvoiceItem = (await Promise.resolve().then(() => require("./chunks/invoiceItem-nbCLMwgg.js"))).default;
  const PurchaseItem = (await Promise.resolve().then(() => require("./chunks/purchaseItem-CTTHQz2J.js"))).default;
  const User = (await Promise.resolve().then(() => require("./chunks/user-DoEgQ7As.js"))).default;
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
  const admin = await User.findOne({ where: { role: "admin" } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin", 12);
    await User.create({
      fullName: "admin",
      username: "admin",
      password: hashedPassword,
      role: "admin"
    });
  }
  const { registerInvoiceHandlers } = await Promise.resolve().then(() => require("./chunks/invoice.handlers-bwHI08w7.js"));
  const { registerCustomerHandlers } = await Promise.resolve().then(() => require("./chunks/customer.handlers-CLbkXNn-.js"));
  const { registerProductHandlers } = await Promise.resolve().then(() => require("./chunks/product.handlers-zqbljPh_.js"));
  const { registerUserHandlers } = await Promise.resolve().then(() => require("./chunks/user.handlers-qERNHyuZ.js"));
  const { registerSupplierHandlers } = await Promise.resolve().then(() => require("./chunks/supplier.handlers-CKqfOFR3.js"));
  const { registerPurchaseHandlers } = await Promise.resolve().then(() => require("./chunks/purchase.handlers-B6HpbW4Z.js"));
  const { registerPaymentHandlers } = await Promise.resolve().then(() => require("./chunks/payment.handlers-CSzkYmA4.js"));
  const { registerReceiptHandlers } = await Promise.resolve().then(() => require("./chunks/receipt.handlers-B3iaECqJ.js"));
  const { registerExpenseHandlers } = await Promise.resolve().then(() => require("./chunks/expense.handlers-BpaZmlXw.js"));
  const { registerStoreInfoHandlers } = await Promise.resolve().then(() => require("./chunks/storeInfo.handlers-DsI117IS.js"));
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
  electron.ipcMain.handle("dialog:selectDbPath", async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Database", extensions: ["db", "sqlite", "sql"] }]
    });
    return result.filePaths[0];
  });
  await createWindow();
  electron.app.on("activate", () => {
    if (mainWindow === null) createWindow();
  });
});
