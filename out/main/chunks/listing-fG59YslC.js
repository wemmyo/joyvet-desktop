"use strict";
const zod = require("zod");
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const basePaginationSchema = zod.z.object({
  page: zod.z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: zod.z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
});
const searchPaginationSchema = basePaginationSchema.extend({
  search: zod.z.string().trim().optional()
});
const invoiceListQuerySchema = basePaginationSchema.extend({
  startDate: zod.z.string().optional(),
  endDate: zod.z.string().optional(),
  saleType: zod.z.string().default("all"),
  search: zod.z.string().trim().optional()
});
const purchaseListQuerySchema = searchPaginationSchema.extend({
  supplierId: zod.z.coerce.number().int().positive().optional(),
  startDate: zod.z.string().optional(),
  endDate: zod.z.string().optional()
});
const paymentListQuerySchema = searchPaginationSchema.extend({
  supplierId: zod.z.coerce.number().int().positive().optional(),
  startDate: zod.z.string().optional(),
  endDate: zod.z.string().optional()
});
const receiptListQuerySchema = searchPaginationSchema.extend({
  customerId: zod.z.coerce.number().int().positive().optional(),
  startDate: zod.z.string().optional(),
  endDate: zod.z.string().optional()
});
const productListQuerySchema = searchPaginationSchema.extend({
  filter: zod.z.enum(["inStock"]).optional()
});
const toPaginationOptions = ({
  page,
  pageSize
}) => ({
  limit: pageSize,
  offset: (page - 1) * pageSize
});
const toPaginatedResult = (rows, total, page, pageSize) => ({
  rows,
  total,
  page,
  pageSize
});
exports.invoiceListQuerySchema = invoiceListQuerySchema;
exports.paymentListQuerySchema = paymentListQuerySchema;
exports.productListQuerySchema = productListQuerySchema;
exports.purchaseListQuerySchema = purchaseListQuerySchema;
exports.receiptListQuerySchema = receiptListQuerySchema;
exports.searchPaginationSchema = searchPaginationSchema;
exports.toPaginatedResult = toPaginatedResult;
exports.toPaginationOptions = toPaginationOptions;
