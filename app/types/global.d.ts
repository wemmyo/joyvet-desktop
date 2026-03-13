declare global {
  interface Window {
    api: {
      invoice: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (invoiceItems: any[], invoice: any) => Promise<any>;
        delete: (id: number) => Promise<void>;
        deleteItem: (args: any) => Promise<void>;
        addItem: (currentInvoice: any, currentInvoiceItem: any) => Promise<void>;
        filter: (startDate: string, endDate: string, saleType: string) => Promise<any[]>;
        filterById: (id: number) => Promise<any[]>;
        getSingle: (id: number) => Promise<any>;
      };
      customer: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (value: string) => Promise<any[]>;
        getInvoices: (customerId: number, startDate: string, endDate: string) => Promise<any[]>;
        getReceipts: (customerId: number, startDate?: string, endDate?: string) => Promise<any[]>;
      };
      product: {
        getAll: (filter?: string) => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<void>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (value: string) => Promise<any[]>;
        getInvoices: (productId: number, startDate: string, endDate: string) => Promise<any[]>;
        getPurchases: (productId: number, startDate: string, endDate: string) => Promise<any[]>;
      };
      user: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<void>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        login: (credentials: { username: string; password: string }) => Promise<any>;
      };
      supplier: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<void>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        search: (value: string) => Promise<any[]>;
        getPayments: (supplierId: number, startDate?: string, endDate?: string) => Promise<any[]>;
        getPurchases: (supplierId: number, startDate: string, endDate: string) => Promise<any[]>;
      };
      purchase: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (purchaseItems: any[], purchase: any) => Promise<any>;
        delete: (id: number) => Promise<void>;
        filter: (startDate: string, endDate: string, supplierId?: number) => Promise<any[]>;
        getBySupplier: (supplierId: number, startDate: string, endDate: string) => Promise<any[]>;
        search: (value: string) => Promise<any[]>;
      };
      payment: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        filter: (startDate: string, endDate: string, supplierId?: number) => Promise<any[]>;
        getBySupplier: (supplierId: number, startDate: string, endDate: string) => Promise<any[]>;
        search: (value: string) => Promise<any[]>;
      };
      receipt: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        filter: (startDate: string, endDate: string, customerId?: number) => Promise<any[]>;
        search: (value: string) => Promise<any[]>;
      };
      expense: {
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        create: (values: any) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        filter: (startDate: string, endDate: string) => Promise<any[]>;
        getTypes: () => Promise<any[]>;
        createType: (values: any) => Promise<any>;
        search: (value: string) => Promise<any[]>;
      };
      storeInfo: {
        get: () => Promise<any>;
        getAll: () => Promise<any[]>;
        getById: (id: number) => Promise<any>;
        update: (id: number, values: any) => Promise<void>;
        delete: (id: number) => Promise<void>;
        create: (values: any) => Promise<any>;
      };
      dialog: {
        selectDbPath: () => Promise<string | undefined>;
      };
    };
  }
}

export {};
