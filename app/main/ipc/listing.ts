import { z } from 'zod';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type PaginatedResult,
} from '../../types/pagination';

const basePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export const searchPaginationSchema = basePaginationSchema.extend({
  search: z.string().trim().optional(),
});

export const invoiceListQuerySchema = basePaginationSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  saleType: z.string().default('all'),
  search: z.string().trim().optional(),
});

export const purchaseListQuerySchema = searchPaginationSchema.extend({
  supplierId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const paymentListQuerySchema = searchPaginationSchema.extend({
  supplierId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const receiptListQuerySchema = searchPaginationSchema.extend({
  customerId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const productListQuerySchema = searchPaginationSchema.extend({
  filter: z.enum(['inStock']).optional(),
});

export const expenseListQuerySchema = searchPaginationSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const toPaginationOptions = ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => ({
  limit: pageSize,
  offset: (page - 1) * pageSize,
});

export const toPaginatedResult = <TRow>(
  rows: TRow[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<TRow> => ({
  rows,
  total,
  page,
  pageSize,
});
