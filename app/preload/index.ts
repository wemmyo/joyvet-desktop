import { contextBridge, ipcRenderer } from 'electron';

const api = {
  invoice: {
    getAll: () => ipcRenderer.invoke('invoice:getAll'),
    getById: (id: number) => ipcRenderer.invoke('invoice:getById', id),
    create: (invoiceItems: any[], invoice: any) =>
      ipcRenderer.invoke('invoice:create', invoiceItems, invoice),
    delete: (id: number) => ipcRenderer.invoke('invoice:delete', id),
    deleteItem: (args: any) => ipcRenderer.invoke('invoice:deleteItem', args),
    addItem: (currentInvoice: any, currentInvoiceItem: any) =>
      ipcRenderer.invoke('invoice:addItem', currentInvoice, currentInvoiceItem),
    filter: (startDate: string, endDate: string, saleType: string) =>
      ipcRenderer.invoke('invoice:filter', startDate, endDate, saleType),
    filterById: (id: number) => ipcRenderer.invoke('invoice:filterById', id),
    getSingle: (id: number) => ipcRenderer.invoke('invoice:getSingle', id),
  },
  customer: {
    getAll: () => ipcRenderer.invoke('customer:getAll'),
    getById: (id: number) => ipcRenderer.invoke('customer:getById', id),
    create: (values: any) => ipcRenderer.invoke('customer:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('customer:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('customer:delete', id),
    search: (value: string) => ipcRenderer.invoke('customer:search', value),
    getInvoices: (customerId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('customer:getInvoices', customerId, startDate, endDate),
    getReceipts: (customerId: number, startDate?: string, endDate?: string) =>
      ipcRenderer.invoke('customer:getReceipts', customerId, startDate, endDate),
  },
  product: {
    getAll: (filter?: string) => ipcRenderer.invoke('product:getAll', filter),
    getById: (id: number) => ipcRenderer.invoke('product:getById', id),
    create: (values: any) => ipcRenderer.invoke('product:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('product:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('product:delete', id),
    search: (value: string) => ipcRenderer.invoke('product:search', value),
    getInvoices: (productId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('product:getInvoices', productId, startDate, endDate),
    getPurchases: (productId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('product:getPurchases', productId, startDate, endDate),
  },
  user: {
    getAll: () => ipcRenderer.invoke('user:getAll'),
    getById: (id: number) => ipcRenderer.invoke('user:getById', id),
    create: (values: any) => ipcRenderer.invoke('user:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('user:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('user:delete', id),
    login: (credentials: { username: string; password: string }) =>
      ipcRenderer.invoke('user:login', credentials),
  },
  supplier: {
    getAll: () => ipcRenderer.invoke('supplier:getAll'),
    getById: (id: number) => ipcRenderer.invoke('supplier:getById', id),
    create: (values: any) => ipcRenderer.invoke('supplier:create', values),
    update: (id: number, values: any) =>
      ipcRenderer.invoke('supplier:update', id, values),
    delete: (id: number) => ipcRenderer.invoke('supplier:delete', id),
    search: (value: string) => ipcRenderer.invoke('supplier:search', value),
  },
  purchase: {
    getAll: () => ipcRenderer.invoke('purchase:getAll'),
    getById: (id: number) => ipcRenderer.invoke('purchase:getById', id),
    create: (purchaseItems: any[], purchase: any) =>
      ipcRenderer.invoke('purchase:create', purchaseItems, purchase),
    delete: (id: number) => ipcRenderer.invoke('purchase:delete', id),
    filter: (startDate: string, endDate: string, supplierId?: number) =>
      ipcRenderer.invoke('purchase:filter', startDate, endDate, supplierId),
    getBySupplier: (supplierId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('purchase:getBySupplier', supplierId, startDate, endDate),
  },
  payment: {
    getAll: () => ipcRenderer.invoke('payment:getAll'),
    create: (values: any) => ipcRenderer.invoke('payment:create', values),
    delete: (id: number) => ipcRenderer.invoke('payment:delete', id),
    filter: (startDate: string, endDate: string, supplierId?: number) =>
      ipcRenderer.invoke('payment:filter', startDate, endDate, supplierId),
    getBySupplier: (supplierId: number, startDate: string, endDate: string) =>
      ipcRenderer.invoke('payment:getBySupplier', supplierId, startDate, endDate),
  },
  receipt: {
    getAll: () => ipcRenderer.invoke('receipt:getAll'),
    create: (values: any) => ipcRenderer.invoke('receipt:create', values),
    delete: (id: number) => ipcRenderer.invoke('receipt:delete', id),
    filter: (startDate: string, endDate: string, customerId?: number) =>
      ipcRenderer.invoke('receipt:filter', startDate, endDate, customerId),
  },
  expense: {
    getAll: () => ipcRenderer.invoke('expense:getAll'),
    create: (values: any) => ipcRenderer.invoke('expense:create', values),
    delete: (id: number) => ipcRenderer.invoke('expense:delete', id),
    filter: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('expense:filter', startDate, endDate),
    getTypes: () => ipcRenderer.invoke('expense:getTypes'),
    createType: (values: any) => ipcRenderer.invoke('expense:createType', values),
  },
  storeInfo: {
    get: () => ipcRenderer.invoke('storeInfo:get'),
    update: (values: any) => ipcRenderer.invoke('storeInfo:update', values),
    create: (values: any) => ipcRenderer.invoke('storeInfo:create', values),
  },
  dialog: {
    selectDbPath: () => ipcRenderer.invoke('dialog:selectDbPath'),
  },
};

contextBridge.exposeInMainWorld('api', api);
