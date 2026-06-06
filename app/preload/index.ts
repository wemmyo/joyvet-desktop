import { contextBridge, ipcRenderer } from 'electron';
import type {
  ExpenseListQuery,
  InvoiceListQuery,
  PaginationQuery,
  PaymentListQuery,
  ProductListQuery,
  PurchaseListQuery,
  ReceiptListQuery,
  SearchPaginationQuery,
} from '../types/pagination';

const api = {
  auth: {
    getBootstrapStatus: () => ipcRenderer.invoke('auth:getBootstrapStatus'),
    createInitialAdmin: (values: {
      fullName: string;
      username: string;
      password: string;
    }) => ipcRenderer.invoke('auth:createInitialAdmin', values),
  },
  invoice: {
    getAll: (query?: PaginationQuery) =>
      ipcRenderer.invoke('invoice:getAll', query),
    create: (invoiceItems: any[], invoice: any) =>
      ipcRenderer.invoke('invoice:create', invoiceItems, invoice),
    delete: (id: number) => ipcRenderer.invoke('invoice:delete', id),
    deleteItem: (args: any) => ipcRenderer.invoke('invoice:deleteItem', args),
    addItem: (currentInvoice: any, currentInvoiceItem: any) =>
      ipcRenderer.invoke('invoice:addItem', currentInvoice, currentInvoiceItem),
    updateItem: (args: {
      invoiceItemId: number;
      invoiceId: number;
      productId: number;
      newQuantity: number;
      postedBy: string;
    }) => ipcRenderer.invoke('invoice:updateItem', args),
    filter: (query: InvoiceListQuery) =>
      ipcRenderer.invoke('invoice:filter', query),
    filterById: (query: InvoiceListQuery) =>
      ipcRenderer.invoke('invoice:filterById', query),
    getSingle: (id: number) => ipcRenderer.invoke('invoice:getSingle', id),
    getAuditLog: (invoiceId?: number) =>
      ipcRenderer.invoke('invoice:getAuditLog', invoiceId),
  },
  customer: {
    getAll: (query?: PaginationQuery) =>
      ipcRenderer.invoke('customer:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('customer:getById', id),
    create: (values: any) => ipcRenderer.invoke('customer:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('customer:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('customer:delete', id),
    search: (query: SearchPaginationQuery) =>
      ipcRenderer.invoke('customer:search', query),
    getInvoices: (customerId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke(
        'customer:getInvoices',
        customerId,
        startDate,
        endDate
      ),
    getReceipts: (customerId: number, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke(
        'customer:getReceipts',
        customerId,
        startDate,
        endDate
      ),
    getActivityTimeline: (
      customerId: number,
      startDate: string,
      endDate: string
    ) =>
      ipcRenderer.invoke(
        'customer:getActivityTimeline',
        customerId,
        startDate,
        endDate
      ),
  },
  product: {
    getAll: (query?: ProductListQuery) =>
      ipcRenderer.invoke('product:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('product:getById', id),
    create: (values: any) => ipcRenderer.invoke('product:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('product:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('product:delete', id),
    search: (query: ProductListQuery) =>
      ipcRenderer.invoke('product:search', query),
    getInvoices: (productId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('product:getInvoices', productId, startDate, endDate),
    getPurchases: (productId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('product:getPurchases', productId, startDate, endDate),
    getAuditLog: (productId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('product:getAuditLog', productId, startDate, endDate),
  },
  user: {
    getAll: (query?: PaginationQuery) =>
      ipcRenderer.invoke('user:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('user:getById', id),
    create: (values: any) => ipcRenderer.invoke('user:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('user:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('user:delete', id),
    login: (credentials: { username: string; password: string }) =>
      ipcRenderer.invoke('user:login', credentials),
    logout: () => ipcRenderer.invoke('user:logout'),
  },
  supplier: {
    getAll: (query?: PaginationQuery) =>
      ipcRenderer.invoke('supplier:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('supplier:getById', id),
    create: (values: any) => ipcRenderer.invoke('supplier:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('supplier:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('supplier:delete', id),
    search: (query: SearchPaginationQuery) =>
      ipcRenderer.invoke('supplier:search', query),
    getActivityTimeline: (
      supplierId: number,
      startDate: string,
      endDate: string
    ) =>
      ipcRenderer.invoke(
        'supplier:getActivityTimeline',
        supplierId,
        startDate,
        endDate
      ),
  },
  purchase: {
    getAll: (query?: PaginationQuery) =>
      ipcRenderer.invoke('purchase:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('purchase:getById', id),
    create: (purchaseItems: any[], purchase: any) =>
      ipcRenderer.invoke('purchase:create', purchaseItems, purchase),
    update: (id: number, purchaseItems: any[], meta: any) =>
      ipcRenderer.invoke('purchase:update', id, purchaseItems, meta),
    delete: (id: number) => ipcRenderer.invoke('purchase:delete', id),
    search: (query: SearchPaginationQuery) =>
      ipcRenderer.invoke('purchase:search', query),
    filter: (query: PurchaseListQuery) =>
      ipcRenderer.invoke('purchase:filter', query),
    getBySupplier: (supplierId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke(
        'purchase:getBySupplier',
        supplierId,
        startDate,
        endDate
      ),
  },
  payment: {
    getAll: (query?: PaginationQuery) =>
      ipcRenderer.invoke('payment:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('payment:getById', id),
    create: (values: any) => ipcRenderer.invoke('payment:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('payment:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('payment:delete', id),
    search: (query: SearchPaginationQuery) =>
      ipcRenderer.invoke('payment:search', query),
    filter: (query: PaymentListQuery) =>
      ipcRenderer.invoke('payment:filter', query),
    getBySupplier: (supplierId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke(
        'payment:getBySupplier',
        supplierId,
        startDate,
        endDate
      ),
  },
  receipt: {
    getAll: (query?: PaginationQuery) =>
      ipcRenderer.invoke('receipt:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('receipt:getById', id),
    create: (values: any) => ipcRenderer.invoke('receipt:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('receipt:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('receipt:delete', id),
    search: (query: SearchPaginationQuery) =>
      ipcRenderer.invoke('receipt:search', query),
    filter: (query: ReceiptListQuery) =>
      ipcRenderer.invoke('receipt:filter', query),
  },
  expense: {
    getAll: (query?: ExpenseListQuery) =>
      ipcRenderer.invoke('expense:getAll', query),
    getById: (id: number) => ipcRenderer.invoke('expense:getById', id),
    create: (values: any) => ipcRenderer.invoke('expense:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('expense:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('expense:delete', id),
    filter: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('expense:filter', startDate, endDate),
    search: (query: ExpenseListQuery) =>
      ipcRenderer.invoke('expense:search', query),
    getTypes: () => ipcRenderer.invoke('expense:getTypes'),
    createType: (values: { type: string }) =>
      ipcRenderer.invoke('expense:createType', values),
  },
  storeInfo: {
    getAll: () => ipcRenderer.invoke('storeInfo:getAll'),
    getById: (id: number) => ipcRenderer.invoke('storeInfo:getById', id),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('storeInfo:update', id, values),
    create: (values: any) => ipcRenderer.invoke('storeInfo:create', values),
    delete: (id: number) => ipcRenderer.invoke('storeInfo:delete', id),
  },
  analytics: {
    getSummary: (input: { startDate: string; endDate: string }) =>
      ipcRenderer.invoke('analytics:getSummary', input),
    getTopCustomers: (input: { startDate: string; endDate: string }) =>
      ipcRenderer.invoke('analytics:getTopCustomers', input),
    getBestSellingProducts: (input: { startDate: string; endDate: string }) =>
      ipcRenderer.invoke('analytics:getBestSellingProducts', input),
    getTopSuppliersBySpend: (input: { startDate: string; endDate: string }) =>
      ipcRenderer.invoke('analytics:getTopSuppliersBySpend', input),
    getLowStockProducts: (input?: any) =>
      ipcRenderer.invoke('analytics:getLowStockProducts', input),
    getRevenueOverTime: () =>
      ipcRenderer.invoke('analytics:getRevenueOverTime'),
    getExpenseBreakdown: (input: { startDate: string; endDate: string }) =>
      ipcRenderer.invoke('analytics:getExpenseBreakdown', input),
  },
  database: {
    getPath: () => ipcRenderer.invoke('database:getPath'),
    changeFile: () => ipcRenderer.invoke('database:changeFile'),
  },
  backup: {
    getConfig: () => ipcRenderer.invoke('backup:getConfig'),
    chooseLocation: () => ipcRenderer.invoke('backup:chooseLocation'),
    now: () => ipcRenderer.invoke('backup:now'),
    restore: () => ipcRenderer.invoke('backup:restore'),
  },
};

contextBridge.exposeInMainWorld('api', api);
