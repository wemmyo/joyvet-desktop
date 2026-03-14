"use strict";
const electron = require("electron");
const api = {
  invoice: {
    getAll: () => electron.ipcRenderer.invoke("invoice:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("invoice:getById", id),
    create: (invoiceItems, invoice) => electron.ipcRenderer.invoke("invoice:create", invoiceItems, invoice),
    delete: (id) => electron.ipcRenderer.invoke("invoice:delete", id),
    deleteItem: (args) => electron.ipcRenderer.invoke("invoice:deleteItem", args),
    addItem: (currentInvoice, currentInvoiceItem) => electron.ipcRenderer.invoke("invoice:addItem", currentInvoice, currentInvoiceItem),
    filter: (startDate, endDate, saleType) => electron.ipcRenderer.invoke("invoice:filter", startDate, endDate, saleType),
    filterById: (id) => electron.ipcRenderer.invoke("invoice:filterById", id),
    getSingle: (id) => electron.ipcRenderer.invoke("invoice:getSingle", id)
  },
  customer: {
    getAll: () => electron.ipcRenderer.invoke("customer:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("customer:getById", id),
    create: (values) => electron.ipcRenderer.invoke("customer:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("customer:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("customer:delete", id),
    search: (value) => electron.ipcRenderer.invoke("customer:search", value),
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
    )
  },
  product: {
    getAll: (filter) => electron.ipcRenderer.invoke("product:getAll", filter),
    getById: (id) => electron.ipcRenderer.invoke("product:getById", id),
    create: (values) => electron.ipcRenderer.invoke("product:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("product:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("product:delete", id),
    search: (value) => electron.ipcRenderer.invoke("product:search", value),
    getInvoices: (productId, startDate, endDate) => electron.ipcRenderer.invoke("product:getInvoices", productId, startDate, endDate),
    getPurchases: (productId, startDate, endDate) => electron.ipcRenderer.invoke("product:getPurchases", productId, startDate, endDate)
  },
  user: {
    getAll: () => electron.ipcRenderer.invoke("user:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("user:getById", id),
    create: (values) => electron.ipcRenderer.invoke("user:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("user:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("user:delete", id),
    login: (credentials) => electron.ipcRenderer.invoke("user:login", credentials)
  },
  supplier: {
    getAll: () => electron.ipcRenderer.invoke("supplier:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("supplier:getById", id),
    create: (values) => electron.ipcRenderer.invoke("supplier:create", values),
    update: (id, values) => electron.ipcRenderer.invoke("supplier:update", id, values),
    delete: (id) => electron.ipcRenderer.invoke("supplier:delete", id),
    search: (value) => electron.ipcRenderer.invoke("supplier:search", value)
  },
  purchase: {
    getAll: () => electron.ipcRenderer.invoke("purchase:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("purchase:getById", id),
    create: (purchaseItems, purchase) => electron.ipcRenderer.invoke("purchase:create", purchaseItems, purchase),
    delete: (id) => electron.ipcRenderer.invoke("purchase:delete", id),
    filter: (startDate, endDate, supplierId) => electron.ipcRenderer.invoke("purchase:filter", startDate, endDate, supplierId),
    getBySupplier: (supplierId, startDate, endDate) => electron.ipcRenderer.invoke(
      "purchase:getBySupplier",
      supplierId,
      startDate,
      endDate
    )
  },
  payment: {
    getAll: () => electron.ipcRenderer.invoke("payment:getAll"),
    create: (values) => electron.ipcRenderer.invoke("payment:create", values),
    delete: (id) => electron.ipcRenderer.invoke("payment:delete", id),
    filter: (startDate, endDate, supplierId) => electron.ipcRenderer.invoke("payment:filter", startDate, endDate, supplierId),
    getBySupplier: (supplierId, startDate, endDate) => electron.ipcRenderer.invoke(
      "payment:getBySupplier",
      supplierId,
      startDate,
      endDate
    )
  },
  receipt: {
    getAll: () => electron.ipcRenderer.invoke("receipt:getAll"),
    create: (values) => electron.ipcRenderer.invoke("receipt:create", values),
    delete: (id) => electron.ipcRenderer.invoke("receipt:delete", id),
    filter: (startDate, endDate, customerId) => electron.ipcRenderer.invoke("receipt:filter", startDate, endDate, customerId)
  },
  expense: {
    getAll: () => electron.ipcRenderer.invoke("expense:getAll"),
    create: (values) => electron.ipcRenderer.invoke("expense:create", values),
    delete: (id) => electron.ipcRenderer.invoke("expense:delete", id),
    filter: (startDate, endDate) => electron.ipcRenderer.invoke("expense:filter", startDate, endDate),
    getTypes: () => electron.ipcRenderer.invoke("expense:getTypes"),
    createType: (values) => electron.ipcRenderer.invoke("expense:createType", values)
  },
  storeInfo: {
    get: () => electron.ipcRenderer.invoke("storeInfo:get"),
    update: (values) => electron.ipcRenderer.invoke("storeInfo:update", values),
    create: (values) => electron.ipcRenderer.invoke("storeInfo:create", values)
  },
  dialog: {
    selectDbPath: () => electron.ipcRenderer.invoke("dialog:selectDbPath")
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
