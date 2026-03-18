import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import PaginationControls from '../../components/PaginationControls/PaginationControls';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../components/ui/table-helpers';
import { numberWithCommas, isAdmin } from '../../utils/helpers';
import routes from '../../routing/routes';
import {
  getAnalyticsSummaryFn,
  getTopCustomersFn,
  getBestSellingProductsFn,
  getTopSuppliersBySpendFn,
  getLowStockProductsFn,
  getRevenueOverTimeFn,
  getExpenseBreakdownFn,
} from '../../controllers/analytics.controller';

const DEFAULT_START = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
const DEFAULT_END = dayjs().format('YYYY-MM-DD');

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(DEFAULT_START);
  const [endDate, setEndDate] = useState(DEFAULT_END);

  const [summary, setSummary] = useState<any>(null);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [bestProducts, setBestProducts] = useState<any[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockTotal, setLowStockTotal] = useState(0);
  const [lowStockSearch, setLowStockSearch] = useState('');
  const [lowStockSearchInput, setLowStockSearchInput] = useState('');
  const LOW_STOCK_PAGE_SIZE = 25;
  const [revenueOverTime, setRevenueOverTime] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin()) {
      navigate(routes.SALES);
    }
  }, [navigate]);

  const fetchLowStock = async (page: number, search: string) => {
    const res = await getLowStockProductsFn({ page, pageSize: LOW_STOCK_PAGE_SIZE, search });
    setLowStock(res?.rows || []);
    setLowStockTotal(res?.total || 0);
  };

  const fetchAll = async (start = startDate, end = endDate) => {
    const input = { startDate: start, endDate: end };
    const [
      summaryRes,
      topCustomersRes,
      bestProductsRes,
      topSuppliersRes,
      lowStockRes,
      revenueRes,
      expenseRes,
    ] = await Promise.all([
      getAnalyticsSummaryFn(input),
      getTopCustomersFn(input),
      getBestSellingProductsFn(input),
      getTopSuppliersBySpendFn(input),
      getLowStockProductsFn({ page: 1, pageSize: LOW_STOCK_PAGE_SIZE }),
      getRevenueOverTimeFn(),
      getExpenseBreakdownFn(input),
    ]);

    setSummary(summaryRes);
    setTopCustomers(topCustomersRes || []);
    setBestProducts(bestProductsRes || []);
    setTopSuppliers(topSuppliersRes || []);
    setLowStock(lowStockRes?.rows || []);
    setLowStockTotal(lowStockRes?.total || 0);
    setLowStockPage(1);
    setLowStockSearch('');
    setLowStockSearchInput('');
    setRevenueOverTime(revenueRes || []);
    setExpenseBreakdown(expenseRes || []);
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const handleApply = () => {
    void fetchAll(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate(DEFAULT_START);
    setEndDate(DEFAULT_END);
    void fetchAll(DEFAULT_START, DEFAULT_END);
  };

  const urgencyBadge = (stock: number, reorderLevel: number) => {
    const ratio = stock / reorderLevel;
    if (stock === 0)
      return (
        <span className="text-xs font-semibold text-white bg-red-600 rounded px-1.5 py-0.5">
          Out of Stock
        </span>
      );
    if (ratio <= 0.25)
      return (
        <span className="text-xs font-semibold text-white bg-orange-500 rounded px-1.5 py-0.5">
          Critical
        </span>
      );
    return (
      <span className="text-xs font-semibold text-yellow-800 bg-yellow-200 rounded px-1.5 py-0.5">
        Low
      </span>
    );
  };

  return (
    <DashboardLayout screenTitle="Analytics">
      {/* Date Range Filter */}
      <div className="flex items-end gap-3 mb-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={handleApply}>Apply</Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { label: 'Total Sales', value: summary.invoiceTotal, color: 'text-blue-600' },
            { label: 'Total Profit', value: summary.invoiceProfit, color: 'text-green-600' },
            { label: 'Total Purchases', value: summary.purchaseTotal, color: 'text-orange-600' },
            { label: 'Total Expenses', value: summary.expenseTotal, color: 'text-red-600' },
            { label: 'Total Receipts', value: summary.receiptTotal, color: 'text-teal-600' },
            { label: 'Total Payments', value: summary.paymentTotal, color: 'text-purple-600' },
            { label: 'Customer Balance', value: summary.customerBalanceSum, color: 'text-blue-700' },
            { label: 'Supplier Balance', value: summary.supplierBalanceSum, color: 'text-orange-700' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-lg font-bold mt-1 ${color}`}>
                ₦{numberWithCommas(value || 0)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Income Statement */}
      {summary && (() => {
        const revenue = summary.invoiceTotal || 0;
        const grossProfit = summary.invoiceProfit || 0;
        const cogs = revenue - grossProfit;
        const operatingExpenses = summary.expenseTotal || 0;
        const operatingIncome = grossProfit - operatingExpenses;
        const netIncome = operatingIncome;
        const pct = (val: number) =>
          revenue === 0 ? '—' : `${((val / revenue) * 100).toFixed(1)}%`;

        const rows: {
          label: string;
          value: number;
          indent?: boolean;
          bold?: boolean;
          dimSign?: boolean;
        }[] = [
          { label: 'Revenue', value: revenue },
          { label: 'Cost of Goods Sold', value: cogs, indent: true, dimSign: true },
          { label: 'Gross Profit', value: grossProfit, bold: true },
          { label: 'Operating Expenses', value: operatingExpenses, indent: true, dimSign: true },
          { label: 'Operating Income', value: operatingIncome, bold: true },
          { label: 'Net Income', value: netIncome, bold: true },
        ];

        return (
          <section className="mb-6">
            <h2 className="text-base font-semibold mb-2">Income Statement</h2>
            <TableFrame>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line Item</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ label, value, indent, bold, dimSign }) => {
                    const isNegative = value < 0;
                    const valueColor =
                      bold && !dimSign
                        ? isNegative
                          ? 'text-red-600'
                          : 'text-green-600'
                        : '';
                    return (
                      <TableRow key={label}>
                        <TableCell
                          className={`${indent ? 'pl-8' : ''} ${bold ? 'font-semibold' : ''}`}
                        >
                          {label}
                        </TableCell>
                        <TableCell
                          className={`text-right ${bold ? 'font-semibold' : ''} ${valueColor} ${isNegative && !bold ? 'text-red-600' : ''}`}
                        >
                          ₦{numberWithCommas(Math.abs(value))}
                          {isNegative && ' (loss)'}
                        </TableCell>
                        <TableCell className={`text-right ${bold ? 'font-semibold' : 'text-muted-foreground'}`}>
                          {pct(value)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableFrame>
          </section>
        );
      })()}

      {/* Revenue Over Time */}
      <section className="mb-6">
        <h2 className="text-base font-semibold mb-2">Revenue Over Time (Last 12 Months)</h2>
        <TableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueOverTime.length > 0 ? (
                revenueOverTime.map((row: any) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell className="text-right">
                      ₦{numberWithCommas(row.revenue || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{numberWithCommas(row.profit || 0)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={3} message="No revenue data available." />
              )}
            </TableBody>
          </Table>
        </TableFrame>
      </section>

      {/* Two-column grid: Top Customers + Best Products */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <section>
          <h2 className="text-base font-semibold mb-2">Top Customers</h2>
          <TableFrame>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.length > 0 ? (
                  topCustomers.map((row: any, i: number) => (
                    <TableRow key={row.customerId}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell className="text-right">
                        ₦{numberWithCommas(row.total || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableEmptyRow colSpan={3} message="No data." />
                )}
              </TableBody>
            </Table>
          </TableFrame>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Best Selling Products</h2>
          <TableFrame>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestProducts.length > 0 ? (
                  bestProducts.map((row: any, i: number) => (
                    <TableRow key={row.productId}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell className="text-right">{row.totalQty}</TableCell>
                      <TableCell className="text-right">
                        ₦{numberWithCommas(row.revenue || 0)}
                      </TableCell>
                      <TableCell className="text-right">{row.marginPct}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableEmptyRow colSpan={5} message="No data." />
                )}
              </TableBody>
            </Table>
          </TableFrame>
        </section>
      </div>

      {/* Top Suppliers */}
      <section className="mb-6">
        <h2 className="text-base font-semibold mb-2">Top Suppliers by Spend</h2>
        <TableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Total Purchases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSuppliers.length > 0 ? (
                topSuppliers.map((row: any, i: number) => (
                  <TableRow key={row.supplierId}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{row.fullName}</TableCell>
                    <TableCell className="text-right">
                      ₦{numberWithCommas(row.total || 0)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={3} message="No data." />
              )}
            </TableBody>
          </Table>
        </TableFrame>
      </section>

      {/* Low Stock Alerts */}
      <section className="mb-6">
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Low Stock Alerts
        </h2>
        <form
          className="mb-2"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = lowStockSearchInput.trim();
            setLowStockSearch(trimmed);
            setLowStockPage(1);
            void fetchLowStock(1, trimmed);
          }}
        >
          <Input
            placeholder="Search product name"
            value={lowStockSearchInput}
            onChange={(e) => {
              setLowStockSearchInput(e.target.value);
              if (e.target.value.trim() === '' && lowStockSearch !== '') {
                setLowStockSearch('');
                setLowStockPage(1);
                void fetchLowStock(1, '');
              }
            }}
          />
        </form>
        <TableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Urgency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.length > 0 ? (
                lowStock.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.title}</TableCell>
                    <TableCell className="text-right font-medium">
                      {row.stock}
                    </TableCell>
                    <TableCell className="text-right">{row.reorderLevel}</TableCell>
                    <TableCell>{urgencyBadge(row.stock, row.reorderLevel)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={4} message="All products are adequately stocked." />
              )}
            </TableBody>
          </Table>
        </TableFrame>
        <PaginationControls
          page={lowStockPage}
          pageSize={LOW_STOCK_PAGE_SIZE}
          total={lowStockTotal}
          onPageChange={(nextPage) => {
            setLowStockPage(nextPage);
            void fetchLowStock(nextPage, lowStockSearch);
          }}
        />
      </section>

      {/* Expense Breakdown */}
      <section className="mb-6">
        <h2 className="text-base font-semibold mb-2">Expense Breakdown</h2>
        <TableFrame>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseBreakdown.length > 0 ? (
                expenseBreakdown.map((row: any) => (
                  <TableRow key={row.type}>
                    <TableCell>{row.type}</TableCell>
                    <TableCell className="text-right">
                      ₦{numberWithCommas(row.total || 0)}
                    </TableCell>
                    <TableCell className="text-right">{row.pct}%</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={3} message="No expense data for this period." />
              )}
            </TableBody>
          </Table>
        </TableFrame>
      </section>
    </DashboardLayout>
  );
};

export default Analytics;
