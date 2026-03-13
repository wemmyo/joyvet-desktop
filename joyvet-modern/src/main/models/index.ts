import Customer from './Customer';
import Product from './Product';
import User from './User';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';
import Payment from './Payment';
import Purchase from './Purchase';
import PurchaseItem from './PurchaseItem';
import Supplier from './Supplier';
import Receipt from './Receipt';
import Expense from './Expense';
import ExpenseType from './ExpenseType';
import StoreInfo from './StoreInfo';

// Define associations based on original structure
// Note: Original models didn't have explicit foreign key constraints
// These are logical associations for the application

// Customer associations
Customer.hasMany(Invoice, { as: 'invoices' });
Customer.hasMany(Receipt, { as: 'receipts' });

// Product associations
Product.hasMany(InvoiceItem, { as: 'invoiceItems' });
Product.hasMany(PurchaseItem, { as: 'purchaseItems' });

// Invoice associations
Invoice.hasMany(InvoiceItem, { as: 'invoiceItems' });

// Purchase associations
Purchase.hasMany(PurchaseItem, { as: 'purchaseItems' });

// Supplier associations
Supplier.hasMany(Payment, { as: 'payments' });
Supplier.hasMany(Purchase, { as: 'purchases' });

// User associations
User.hasMany(Customer, { as: 'customers', foreignKey: 'postedBy' });
User.hasMany(Product, { as: 'products', foreignKey: 'postedBy' });
User.hasMany(Invoice, { as: 'invoices', foreignKey: 'postedBy' });
User.hasMany(Payment, { as: 'payments', foreignKey: 'postedBy' });
User.hasMany(Purchase, { as: 'purchases', foreignKey: 'postedBy' });
User.hasMany(Supplier, { as: 'suppliers', foreignKey: 'postedBy' });
User.hasMany(Receipt, { as: 'receipts', foreignKey: 'postedBy' });
User.hasMany(Expense, { as: 'expenses', foreignKey: 'postedBy' });

export {
  Customer,
  Product,
  User,
  Invoice,
  InvoiceItem,
  Payment,
  Purchase,
  PurchaseItem,
  Supplier,
  Receipt,
  Expense,
  ExpenseType,
  StoreInfo,
};
