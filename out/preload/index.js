"use strict";
const electron = require("electron");
const api = {
  auth: {
    getBootstrapStatus: () => electron.ipcRenderer.invoke("auth:getBootstrapStatus"),
    createInitialAdmin: (values) => electron.ipcRenderer.invoke("auth:createInitialAdmin", values)
  },
  invoice: {
    getAll: (query) => electron.ipcRenderer.invoke("invoice:getAll", query),
    create: (invoiceItems, invoice) => electron.ipcRenderer.invoke("invoice:create", invoiceItems, invoice),
    delete: (id) => electron.ipcRenderer.invoke("invoice:delete", id),
    deleteItem: (args) => electron.ipcRenderer.invoke("invoice:deleteItem", args),
    addItem: (currentInvoice, currentInvoiceItem) => electron.ipcRenderer.invoke("invoice:addItem", currentInvoice, currentInvoiceItem),
    updateItem: (args) => electron.ipcRenderer.invoke("invoice:updateItem", args),
    filter: (query) => electron.ipcRenderer.invoke("invoice:filter", query),
    filterById: (query) => electron.ipcRenderer.invoke("invoice:filterById", query),
    getSingle: (id) => electron.ipcRenderer.invoke("invoice:getSingle", id)
  },
  customer: {
    getAll: (query) => electron.ipcRenderer.invoke("customer:getAll", query),
    getById: (id) => electron.ipcRenderer.invoke("customer:getById", id),
    create: (values) => electron.ipcRenderer.invoke("customer:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("customer:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("customer:delete", id),
    search: (query) => electron.ipcRenderer.invoke("customer:search", query),
    getInvoices: (customerId, startDate, endDate) => electron.ipcRenderer.invoke(
      "customer:getInvoices",
      customerId,
      startDate,
      endDate
    ),
    getReceipts: (customerId, startDate, endDate) => electron.ipcRenderer.invoke(
      "customer:getReceipts",
      customerId,
      startDate,
      endDate
    ),
    getActivityTimeline: (customerId, startDate, endDate) => electron.ipcRenderer.invoke(
      "customer:getActivityTimeline",
      customerId,
      startDate,
      endDate
    )
  },
  product: {
    getAll: (query) => electron.ipcRenderer.invoke("product:getAll", query),
    getById: (id) => electron.ipcRenderer.invoke("product:getById", id),
    create: (values) => electron.ipcRenderer.invoke("product:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("product:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("product:delete", id),
    search: (query) => electron.ipcRenderer.invoke("product:search", query),
    getInvoices: (productId, startDate, endDate) => electron.ipcRenderer.invoke("product:getInvoices", productId, startDate, endDate),
    getPurchases: (productId, startDate, endDate) => electron.ipcRenderer.invoke("product:getPurchases", productId, startDate, endDate),
    getAuditLog: (productId, startDate, endDate) => electron.ipcRenderer.invoke("product:getAuditLog", productId, startDate, endDate)
  },
  user: {
    getAll: (query) => electron.ipcRenderer.invoke("user:getAll", query),
    getById: (id) => electron.ipcRenderer.invoke("user:getById", id),
    create: (values) => electron.ipcRenderer.invoke("user:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("user:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("user:delete", id),
    login: (credentials) => electron.ipcRenderer.invoke("user:login", credentials)
  },
  supplier: {
    getAll: (query) => electron.ipcRenderer.invoke("supplier:getAll", query),
    getById: (id) => electron.ipcRenderer.invoke("supplier:getById", id),
    create: (values) => electron.ipcRenderer.invoke("supplier:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("supplier:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("supplier:delete", id),
    search: (query) => electron.ipcRenderer.invoke("supplier:search", query),
    getActivityTimeline: (supplierId, startDate, endDate) => electron.ipcRenderer.invoke(
      "supplier:getActivityTimeline",
      supplierId,
      startDate,
      endDate
    )
  },
  purchase: {
    getAll: (query) => electron.ipcRenderer.invoke("purchase:getAll", query),
    getById: (id) => electron.ipcRenderer.invoke("purchase:getById", id),
    create: (purchaseItems, purchase) => electron.ipcRenderer.invoke("purchase:create", purchaseItems, purchase),
    update: (id, purchaseItems, meta) => electron.ipcRenderer.invoke("purchase:update", id, purchaseItems, meta),
    delete: (id) => electron.ipcRenderer.invoke("purchase:delete", id),
    search: (query) => electron.ipcRenderer.invoke("purchase:search", query),
    filter: (query) => electron.ipcRenderer.invoke("purchase:filter", query),
    getBySupplier: (supplierId, startDate, endDate) => electron.ipcRenderer.invoke(
      "purchase:getBySupplier",
      supplierId,
      startDate,
      endDate
    )
  },
  payment: {
    getAll: (query) => electron.ipcRenderer.invoke("payment:getAll", query),
    getById: (id) => electron.ipcRenderer.invoke("payment:getById", id),
    create: (values) => electron.ipcRenderer.invoke("payment:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("payment:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("payment:delete", id),
    search: (query) => electron.ipcRenderer.invoke("payment:search", query),
    filter: (query) => electron.ipcRenderer.invoke("payment:filter", query),
    getBySupplier: (supplierId, startDate, endDate) => electron.ipcRenderer.invoke(
      "payment:getBySupplier",
      supplierId,
      startDate,
      endDate
    )
  },
  receipt: {
    getAll: (query) => electron.ipcRenderer.invoke("receipt:getAll", query),
    getById: (id) => electron.ipcRenderer.invoke("receipt:getById", id),
    create: (values) => electron.ipcRenderer.invoke("receipt:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("receipt:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("receipt:delete", id),
    search: (query) => electron.ipcRenderer.invoke("receipt:search", query),
    filter: (query) => electron.ipcRenderer.invoke("receipt:filter", query)
  },
  expense: {
    getAll: () => electron.ipcRenderer.invoke("expense:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("expense:getById", id),
    create: (values) => electron.ipcRenderer.invoke("expense:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("expense:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("expense:delete", id),
    search: (value) => electron.ipcRenderer.invoke("expense:search", value),
    filter: (startDate, endDate) => electron.ipcRenderer.invoke("expense:filter", startDate, endDate),
    getTypes: () => electron.ipcRenderer.invoke("expense:getTypes"),
    createType: (values) => electron.ipcRenderer.invoke("expense:createType", values)
  },
  storeInfo: {
    getAll: () => electron.ipcRenderer.invoke("storeInfo:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("storeInfo:getById", id),
    update: (id, values) => electron.ipcRenderer.invoke("storeInfo:update", id, values),
    create: (values) => electron.ipcRenderer.invoke("storeInfo:create", values),
    delete: (id) => electron.ipcRenderer.invoke("storeInfo:delete", id)
  },
  analytics: {
    getSummary: (input) => electron.ipcRenderer.invoke("analytics:getSummary", input),
    getTopCustomers: (input) => electron.ipcRenderer.invoke("analytics:getTopCustomers", input),
    getBestSellingProducts: (input) => electron.ipcRenderer.invoke("analytics:getBestSellingProducts", input),
    getTopSuppliersBySpend: (input) => electron.ipcRenderer.invoke("analytics:getTopSuppliersBySpend", input),
    getLowStockProducts: (input) => electron.ipcRenderer.invoke("analytics:getLowStockProducts", input),
    getRevenueOverTime: () => electron.ipcRenderer.invoke("analytics:getRevenueOverTime"),
    getExpenseBreakdown: (input) => electron.ipcRenderer.invoke("analytics:getExpenseBreakdown", input)
  },
  dialog: {
    selectDbPath: () => electron.ipcRenderer.invoke("dialog:selectDbPath")
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
