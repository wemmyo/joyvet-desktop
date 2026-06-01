import dayjs from 'dayjs';
import { Printer } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
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
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { TableEmptyRow, TableFrame } from '../../components/ui/table-helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import { filterInvoiceFn } from '../../controllers/invoice.controller';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import type { IInvoice } from '../../models/invoice';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { isAdmin, numberWithCommas } from '../../utils/helpers';
import SalesDetail from './components/SalesDetail';

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
  const [amountTotal, setAmountTotal] = useState(0);
  const [profitTotal, setProfitTotal] = useState(0);
  const [printRows, setPrintRows] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintRows([]),
  });

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
        setAmountTotal(response.totals?.amount ?? 0);
        setProfitTotal(response.totals?.profit ?? 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load sales');
      } finally {
        setLoading(false);
      }
    },
    [appliedSearch, endDate, saleType, startDate]
  );

  // Fetch the entire filtered set and print it (all pages, not just the current one).
  const handlePrintAll = async () => {
    try {
      const response = await filterInvoiceFn({
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        startDate,
        endDate,
        saleType,
        search: appliedSearch || undefined,
        all: true,
      });
      setPrintRows(response.rows ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to prepare print');
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handlePrint is stable
  useEffect(() => {
    if (printRows.length > 0) {
      handlePrint?.();
    }
  }, [printRows]);

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

  const renderRows = (list: IInvoice[]) =>
    list.map((each) => (
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
    ));

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
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            void handlePrintAll();
          }}
        >
          <Printer className="h-4 w-4" />
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

  // Shared table markup. `showEmpty` renders the empty-state row when there are
  // no rows (used for the on-screen table; the hidden print table omits it).
  const renderSalesTable = (list: IInvoice[], showEmpty: boolean) => (
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
          {list.length > 0 ? (
            renderRows(list)
          ) : showEmpty ? (
            <TableEmptyRow
              colSpan={isAdmin() ? 6 : 5}
              message="No sales found."
            />
          ) : null}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={isAdmin() ? 4 : 3}>Total</TableCell>
            {isAdmin() ? (
              <>
                <TableCell className="text-right">
                  ₦{numberWithCommas(amountTotal)}
                </TableCell>
                <TableCell className="text-right">
                  ₦{numberWithCommas(profitTotal)}
                </TableCell>
              </>
            ) : (
              <TableCell className="text-right">
                ₦{numberWithCommas(amountTotal)}
              </TableCell>
            )}
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </TableFrame>
  );

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
          {renderSalesTable(invoices, true)}
          <PaginationControls
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
      {/* Hidden full-dataset table used only for printing all pages. */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>{renderSalesTable(printRows, false)}</div>
      </div>
    </DashboardLayout>
  );
};

export default SalesScreen;
