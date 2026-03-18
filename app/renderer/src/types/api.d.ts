import type {
  InvoiceListQuery,
  PaginatedResult,
  PaginationQuery,
  PaymentListQuery,
  ProductListQuery,
  PurchaseListQuery,
  ReceiptListQuery,
  SearchPaginationQuery,
} from '../../../types/pagination';

declare global {
  interface Window {
    api: {
      auth: {
        getBootstrapStatus: () => Promise<{ hasUsers: boolean }>;
        createInitialAdmin: (values: {
          fullName: string;
          username: string;
          password: string;
        }) => Promise<any>;
      };
      invoice: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<any>>;
        create: (invoiceItems: any[], invoice: any) => Promise<any>;
        delete: (id: number) => Promise<void>;
        deleteItem: (args: any) => Promise<void>;
        addItem: (
          currentInvoice: any,
          currentInvoiceItem: any
        ) => Promise<void>;
        updateItem: (args: {
          invoiceItemId: number;
          invoiceId: number;
          productId: number;
          newQuantity: number;
          postedBy: string;
        }) => Promise<void>;
        filter: (query: InvoiceListQuery) => Promise<PaginatedResult<any>>;
        filterById: (query: InvoiceListQuery) => Promise<PaginatedResult<any>>;
        getSingle: (id: number) => Promise<any>;
      };
      customer: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<any>>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<any>>;
        getInvoices: (
          customerId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
        getReceipts: (
          customerId: number,
          startDate?: string,
          endDate?: string
        ) => Promise<any[]>;
        getActivityTimeline: (
          customerId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      product: {
        getAll: (query?: ProductListQuery) => Promise<PaginatedResult<any>>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<void>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (query: ProductListQuery) => Promise<PaginatedResult<any>>;
        getInvoices: (
          productId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
        getPurchases: (
          productId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
        getAuditLog: (
          productId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      user: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<any>>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<void>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        login: (credentials: {
          username: string;
          password: string;
        }) => Promise<any>;
      };
      supplier: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<any>>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<void>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<any>>;
        getActivityTimeline: (
          supplierId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      purchase: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<any>>;
        getById: (id: number) => Promise<any>;
        create: (purchaseItems: any[], purchase: any) => Promise<any>;
        update: (id: number, purchaseItems: any[], meta: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<any>>;
        filter: (query: PurchaseListQuery) => Promise<PaginatedResult<any>>;
        getBySupplier: (
          supplierId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      payment: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<any>>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<any>>;
        filter: (query: PaymentListQuery) => Promise<PaginatedResult<any>>;
        getBySupplier: (
          supplierId: number,
          startDate: string,
          endDate: string
        ) => Promise<any[]>;
      };
      receipt: {
        getAll: (query?: PaginationQuery) => Promise<PaginatedResult<any>>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (
          query: SearchPaginationQuery
        ) => Promise<PaginatedResult<any>>;
        filter: (query: ReceiptListQuery) => Promise<PaginatedResult<any>>;
      };
      expense: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (value: string) => Promise<any[]>;
        filter: (startDate: string, endDate: string) => Promise<any[]>;
        getTypes: () => Promise<any[]>;
        createType: (values: any) => Promise<any>;
      };
      storeInfo: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        create: (values: any) => Promise<any>;
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
        getLowStockProducts: () => Promise<any[]>;
        getRevenueOverTime: () => Promise<any[]>;
        getExpenseBreakdown: (input: {
          startDate: string;
          endDate: string;
        }) => Promise<any[]>;
      };
      dialog: {
        selectDbPath: () => Promise<string | undefined>;
      };
    };
  }
}

export {};
