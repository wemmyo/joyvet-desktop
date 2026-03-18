export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface SearchPaginationQuery extends PaginationQuery {
  search?: string;
}

export interface InvoiceListQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  saleType?: string;
  search?: string;
}

export interface PurchaseListQuery extends SearchPaginationQuery {
  supplierId?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaymentListQuery extends SearchPaginationQuery {
  supplierId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ReceiptListQuery extends SearchPaginationQuery {
  customerId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ProductListQuery extends SearchPaginationQuery {
  filter?: 'inStock';
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}
