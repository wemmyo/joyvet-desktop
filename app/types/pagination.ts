export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  /** When true, return every matching row (ignores page/pageSize). Used for printing. */
  all?: boolean;
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
  filter?: "inStock";
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  /** Aggregate sums computed over the entire filtered set (not just this page). */
  totals?: Record<string, number>;
}

export interface ExpenseListQuery extends SearchPaginationQuery {
  startDate?: string;
  endDate?: string;
}
