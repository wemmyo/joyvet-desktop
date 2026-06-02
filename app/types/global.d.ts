import type { ICustomer } from '../models/customer';
import type { IExpense } from '../models/expense';
import type { ExpenseType } from '../models/expenseType';
import type { IInvoice } from '../models/invoice';
import type { IInvoiceAuditLog } from '../models/invoiceAuditLog';
import type { IInvoiceItem } from '../models/invoiceItem';
import type { IPayment } from '../models/payment';
import type { IProduct } from '../models/product';
import type { IPurchase } from '../models/purchase';
import type { IReceipt } from '../models/receipt';
import type { IStoreInfo } from '../models/storeInfo';
import type { ISupplier } from '../models/supplier';
import type { IUser } from '../models/user';
import type {
  ExpenseListQuery,
  InvoiceListQuery,
  PaginatedResult,
  PaginationQuery,
  PaymentListQuery,
  ProductListQuery,
  PurchaseListQuery,
  ReceiptListQuery,
  SearchPaginationQuery,
} from './pagination';

declare global {
  interface Window {
    api: {
      auth: {
        getBootstrapStatus: () => Promise<{ hasUsers: boolean }>;
        createInitialAdmin: (values: {
          fullName: string;
          username: string;
          password: string;
        }) => Promise<IUser>;
      };
      invoice: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<IInvoice>>;
        create: (
          invoiceItems: Omit<IInvoiceItem, 'id' | 'createdAt' | 'updatedAt'>[],
          invoice: Partial<IInvoice>
        ) => Promise<{ id: number }>;
        delete: (id: number) => Promise<void>;
        deleteItem: (args: {
          productId: number;
          invoiceId: number;
          invoiceItemId: number;
        }) => Promise<void>;
        addItem: (
          currentInvoice: IInvoice,
          currentInvoiceItem: Partial<IInvoiceItem>
        ) => Promise<void>;
        updateItem: (args: {
          invoiceItemId: number;
          invoiceId: number;
          productId: number;
          newQuantity: number;
          postedBy: string;
        }) => Promise<void>;
        filter: (query: InvoiceListQuery) => Promise<PaginatedResult<IInvoice>>;
        filterById: (
          query: InvoiceListQuery
        ) => Promise<PaginatedResult<IInvoice>>;
        getSingle: (id: number) => Promise<IInvoice>;
        getAuditLog: (invoiceId?: number) => Promise<IInvoiceAuditLog[]>;
      };
      customer: {
        getAll: (
          query?: PaginationQuery
        ) => Promise<PaginatedResult<ICustomer>>;
        getById: (id: number) => Promise<ICustomer>;
        create: (values: Partial<ICustomer>) => Promise<ICustomer>;
        update: (id: number, values: Partial<ICustomer>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<ICustomer>>;
        getInvoices: (
          customerId: number,
          startDate: string,
          endDate: string
        ) => Promise<IInvoice[]>;
        getReceipts: (
          customerId: number,
          startDate?: string,
          endDate?: string
        ) => Promise<IReceipt[]>;
        getActivityTimeline: (
          customerId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      product: {
        getAll: (
          query?: ProductListQuery
        ) => Promise<PaginatedResult<IProduct>>;
        getById: (id: number) => Promise<IProduct>;
        create: (values: Partial<IProduct>) => Promise<void>;
        update: (id: number, values: Partial<IProduct>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (query: ProductListQuery) => Promise<PaginatedResult<IProduct>>;
        getInvoices: (
          productId: number,
          startDate: string,
          endDate: string
        ) => Promise<IInvoice[]>;
        getPurchases: (
          productId: number,
          startDate: string,
          endDate: string
        ) => Promise<IPurchase[]>;
        getAuditLog: (
          productId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      user: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<IUser>>;
        getById: (id: number) => Promise<IUser>;
        create: (
          values: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>
        ) => Promise<void>;
        update: (id: number, values: Partial<IUser>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        login: (credentials: {
          username: string;
          password: string;
        }) => Promise<IUser>;
        logout: () => Promise<void>;
      };
      supplier: {
        getAll: (
          query?: PaginationQuery
        ) => Promise<PaginatedResult<ISupplier>>;
        getById: (id: number) => Promise<ISupplier>;
        create: (values: Partial<ISupplier>) => Promise<void>;
        update: (id: number, values: Partial<ISupplier>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<ISupplier>>;
        getActivityTimeline: (
          supplierId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      purchase: {
        getAll: (
          query?: PaginationQuery
        ) => Promise<PaginatedResult<IPurchase>>;
        getById: (id: number) => Promise<IPurchase>;
        create: (
          purchaseItems: any[],
          purchase: Partial<IPurchase>
        ) => Promise<{ id: number }>;
        update: (
          id: number,
          purchaseItems: any[],
          meta: { invoiceNumber: string; amount: number; postedBy?: string }
        ) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<IPurchase>>;
        filter: (
          query: PurchaseListQuery
        ) => Promise<PaginatedResult<IPurchase>>;
        getBySupplier: (
          supplierId: number,
          startDate: string,
          endDate: string
        ) => Promise<IPurchase[]>;
      };
      payment: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<IPayment>>;
        getById: (id: number) => Promise<IPayment>;
        create: (values: Partial<IPayment>) => Promise<IPayment>;
        update: (id: number, values: Partial<IPayment>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<IPayment>>;
        filter: (query: PaymentListQuery) => Promise<PaginatedResult<IPayment>>;
        getBySupplier: (
          supplierId: number,
          startDate: string,
          endDate: string
        ) => Promise<IPayment[]>;
      };
      receipt: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<IReceipt>>;
        getById: (id: number) => Promise<IReceipt>;
        create: (values: Partial<IReceipt>) => Promise<IReceipt>;
        update: (id: number, values: Partial<IReceipt>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<IReceipt>>;
        filter: (query: ReceiptListQuery) => Promise<PaginatedResult<IReceipt>>;
      };
      expense: {
        getAll: (
          query?: ExpenseListQuery
        ) => Promise<PaginatedResult<IExpense>>;
        getById: (id: number) => Promise<IExpense>;
        create: (values: Partial<IExpense>) => Promise<IExpense>;
        update: (id: number, values: Partial<IExpense>) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (query: ExpenseListQuery) => Promise<PaginatedResult<IExpense>>;
        filter: (startDate: string, endDate: string) => Promise<IExpense[]>;
        getTypes: () => Promise<ExpenseType[]>;
        createType: (values: Pick<ExpenseType, 'type'>) => Promise<ExpenseType>;
      };
      storeInfo: {
        getAll: () => Promise<IStoreInfo[]>;
        getById: (id: number) => Promise<IStoreInfo>;
        update: (id: number, values: Partial<IStoreInfo>) => Promise<void>;
        create: (values: Partial<IStoreInfo>) => Promise<IStoreInfo>;
        delete: (id: number) => Promise<void>;
      };
      analytics: {
        getSummary: (input: {
          startDate: string;
          endDate: string;
        }) => Promise<{
          invoiceTotal: number;
          invoiceProfit: number;
          purchaseTotal: number;
          receiptTotal: number;
          paymentTotal: number;
          expenseTotal: number;
          customerBalanceSum: number;
          supplierBalanceSum: number;
        }>;
        getTopCustomers: (input: {
          startDate: string;
          endDate: string;
        }) => Promise<any[]>;
        getBestSellingProducts: (input: {
          startDate: string;
          endDate: string;
        }) => Promise<any[]>;
        getTopSuppliersBySpend: (input: {
          startDate: string;
          endDate: string;
        }) => Promise<any[]>;
        getLowStockProducts: (input?: {
          page?: number;
          pageSize?: number;
          search?: string;
        }) => Promise<PaginatedResult<IProduct>>;
        getRevenueOverTime: () => Promise<any[]>;
        getExpenseBreakdown: (input: {
          startDate: string;
          endDate: string;
        }) => Promise<any[]>;
      };
      database: {
        getPath: () => Promise<string | undefined>;
        changeFile: () => Promise<{ changed: boolean; path?: string }>;
      };
    };
  }
}
