import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import PaginationControls from '../../components/PaginationControls/PaginationControls';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { TableEmptyRow, TableFrame } from '../../components/ui/table-helpers';
import { numberWithCommas, isAdmin } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import SalesDetail from './components/SalesDetail';
import { filterInvoiceFn } from '../../controllers/invoice.controller';
import { IInvoice } from '../../models/invoice';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';

const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;
const CONTENT_DETAIL = 'detail';

const SalesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [salesId, setSalesId] = useState<number | undefined>();
  const [saleType, setSaleType] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  const loadInvoices = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await filterInvoiceFn({
          page: nextPage,
          pageSize: DEFAULT_PAGE_SIZE,
          startDate,
          endDate,
          saleType,
          search: appliedSearch || undefined,
        });
        setInvoices(response.rows ?? []);
        setTotal(response.total ?? 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load sales');
      } finally {
        setLoading(false);
      }
    },
    [appliedSearch, endDate, saleType, startDate]
  );

  useEffect(() => {
    void loadInvoices(page);
  }, [loadInvoices, page]);

  useEffect(() => {
    return () => {
      closeSideBar();
      setSideContent('');
      setSalesId(undefined);
    };
  }, [closeSideBar]);

  const openSingleSale = async (id: number) => {
    setSalesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = invoices.map((each) => {
    return (
      <TableRow
        onClick={() => openSingleSale(each.id)}
        key={each.id}
        className="cursor-pointer"
      >
        <TableCell>{each.customer?.fullName}</TableCell>
        <TableCell>{each.id}</TableCell>
        <TableCell>{each.saleType}</TableCell>
        <TableCell className="text-right">
          ₦{numberWithCommas(each.amount)}
        </TableCell>
        {isAdmin() ? (
          <TableCell className="text-right">
            ₦{numberWithCommas(each.profit)}
          </TableCell>
        ) : null}
        <TableCell>{dayjs(each.createdAt).format('DD/MM/YYYY')}</TableCell>
      </TableRow>
    );
  });

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return (
        <SalesDetail salesId={Number(salesId)} onRefresh={fetchInvoices} />
      );
    }
    return null;
  };

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
    setSaleType('all');
    setSearchValue('');
    setAppliedSearch('');
    setPage(DEFAULT_PAGE);
  };

  const fetchInvoices = useCallback(async () => {
    await loadInvoices(page);
  }, [loadInvoices, page]);

  const headerContent = () => {
    return (
      <div className="flex items-end gap-2 flex-wrap">
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>

        <div className="flex items-end gap-2 flex-wrap">
          <div className="space-y-1">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
              value={startDate}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
              value={endDate}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="saleType">Type</Label>
            <Select value={saleType} onValueChange={setSaleType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="search">Search</Label>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setAppliedSearch(searchValue.trim());
                setPage(DEFAULT_PAGE);
              }}
            >
              <Input
                id="search"
                placeholder="Invoice number"
                onChange={(e) => {
                  const nextSearchValue = e.target.value;
                  setSearchValue(nextSearchValue);
                  if (nextSearchValue.trim() === '' && appliedSearch !== '') {
                    setAppliedSearch('');
                    setPage(DEFAULT_PAGE);
                  }
                }}
                value={searchValue}
              />
            </form>
          </div>
        </div>
      </div>
    );
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfAmount = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices
      .map((item) => {
        return item.amount;
      })
      .reduce(sum);
  };
  const sumOfProfit = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices
      .map((item) => {
        return item.profit;
      })
      .reduce(sum);
  };

  return (
    <DashboardLayout
      screenTitle="Sales"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {error && <p className="text-destructive text-sm p-4">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <TableFrame>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {isAdmin() ? (
                    <TableHead className="text-right">Profit</TableHead>
                  ) : null}
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.length > 0 ? (
                  renderRows
                ) : (
                  <TableEmptyRow
                    colSpan={isAdmin() ? 6 : 5}
                    message="No sales found."
                  />
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={isAdmin() ? 4 : 3}>Total</TableCell>
                  {isAdmin() ? (
                    <>
                      <TableCell className="text-right">
                        ₦{numberWithCommas(sumOfAmount())}
                      </TableCell>
                      <TableCell className="text-right">
                        ₦{numberWithCommas(sumOfProfit())}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right">
                      ₦{numberWithCommas(sumOfAmount())}
                    </TableCell>
                  )}
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </TableFrame>
          <PaginationControls
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default SalesScreen;
