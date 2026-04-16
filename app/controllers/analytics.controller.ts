import { toast } from 'sonner';

export const getAnalyticsSummaryFn = async (input: {
  startDate: string;
  endDate: string;
}) => {
  try {
    return await window.api.analytics.getSummary(input);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return null;
  }
};

export const getTopCustomersFn = async (input: {
  startDate: string;
  endDate: string;
}) => {
  try {
    return await window.api.analytics.getTopCustomers(input);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};

export const getBestSellingProductsFn = async (input: {
  startDate: string;
  endDate: string;
}) => {
  try {
    return await window.api.analytics.getBestSellingProducts(input);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};

export const getTopSuppliersBySpendFn = async (input: {
  startDate: string;
  endDate: string;
}) => {
  try {
    return await window.api.analytics.getTopSuppliersBySpend(input);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};

export const getLowStockProductsFn = async (query?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
  try {
    return await window.api.analytics.getLowStockProducts(query);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return { rows: [], total: 0, page: 1, pageSize: 25 };
  }
};

export const getRevenueOverTimeFn = async () => {
  try {
    return await window.api.analytics.getRevenueOverTime();
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};

export const getExpenseBreakdownFn = async (input: {
  startDate: string;
  endDate: string;
}) => {
  try {
    return await window.api.analytics.getExpenseBreakdown(input);
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : '');
    return [];
  }
};
