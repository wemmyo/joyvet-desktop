import type { Model, ModelStatic, Sequelize } from 'sequelize';
import { maybeSeedDevelopmentAdmin } from './bootstrap';

type AnyModel = ModelStatic<Model>;

type CoreModels = {
  database: Sequelize;
  Customer: AnyModel;
  Invoice: AnyModel;
  Payment: AnyModel;
  Product: AnyModel;
  Purchase: AnyModel;
  Receipt: AnyModel;
  Supplier: AnyModel;
  InvoiceItem: AnyModel;
  PurchaseItem: AnyModel;
  User: AnyModel;
  ProductAuditLog: AnyModel;
  InvoiceAuditLog: AnyModel;
  StoreInfo: AnyModel;
  Expense: AnyModel;
  ExpenseType: AnyModel;
};

let authReadyPromise: Promise<{ User: AnyModel }> | null = null;
let appReadyPromise: Promise<void> | null = null;
let associationsRegistered = false;

const loadAuthModel = async () => {
  return {
    User: (await import('../models/user')).default,
  };
};

const loadCoreModels = async (): Promise<CoreModels> => {
  const { default: database } = await import('./database');

  return {
    database,
    Customer: (await import('../models/customer')).default,
    Invoice: (await import('../models/invoice')).default,
    Payment: (await import('../models/payment')).default,
    Product: (await import('../models/product')).default,
    Purchase: (await import('../models/purchase')).default,
    Receipt: (await import('../models/receipt')).default,
    Supplier: (await import('../models/supplier')).default,
    InvoiceItem: (await import('../models/invoiceItem')).default,
    PurchaseItem: (await import('../models/purchaseItem')).default,
    User: (await import('../models/user')).default,
    ProductAuditLog: (await import('../models/productAuditLog')).default,
    InvoiceAuditLog: (await import('../models/invoiceAuditLog')).default,
    StoreInfo: (await import('../models/storeInfo')).default,
    Expense: (await import('../models/expense')).default,
    ExpenseType: (await import('../models/expenseType')).default,
  };
};

const registerAssociations = (models: CoreModels) => {
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
    InvoiceAuditLog,
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
  Product.hasMany(ProductAuditLog, { foreignKey: 'productId' });
  ProductAuditLog.belongsTo(Product, { foreignKey: 'productId' });
  Invoice.hasMany(InvoiceAuditLog, { foreignKey: 'invoiceId' });
  InvoiceAuditLog.belongsTo(Invoice, { foreignKey: 'invoiceId' });

  associationsRegistered = true;
};

export const ensureAuthReady = async () => {
  if (!authReadyPromise) {
    authReadyPromise = (async () => {
      const { User } = await loadAuthModel();
      await User.sync();
      return { User };
    })();
  }

  return authReadyPromise;
};

export const ensureAppReady = async () => {
  if (!appReadyPromise) {
    appReadyPromise = (async () => {
      const models = await loadCoreModels();
      registerAssociations(models);
      await models.database.sync();
      await maybeSeedDevelopmentAdmin(models.User as any);
    })();
  }

  return appReadyPromise;
};

export const withAppReady = <Args extends unknown[], Result>(
  handler: (...args: Args) => Promise<Result> | Result
) => {
  return async (...args: Args): Promise<Result> => {
    await ensureAppReady();
    return handler(...args);
  };
};
