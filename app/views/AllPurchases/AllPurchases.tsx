import dayjs from 'dayjs';
import { RefreshCw } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

import PaginationControls from '../../components/PaginationControls/PaginationControls';
import { usePagination } from '../../hooks/usePagination';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { TableEmptyRow, TableFrame } from '../../components/ui/table-helpers';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import { useSidebarContext } from '../../contexts/SidebarContext';
import {
  getPurchasesFn,
  searchPurchaseFn,
} from '../../controllers/purchase.controller';
import type { IPurchase } from '../../models/purchase';
import { DEFAULT_PAGE } from '../../types/pagination';
import { numberWithCommas } from '../../utils/helpers';
import PurchaseDetail from './components/PurchaseDetail';

const CONTENT_DETAIL = 'detail';

const AllPurchasesScreen: React.FC = () => {
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();
  const [sideContent, setSideContent] = useState('');
  const [purchaseId, setPurchasesId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const {
    page,
    setPage,
    pageSize,
    showAll,
    onPageSizeChange,
    onShowAllChange,
  } = usePagination();
  const [total, setTotal] = useState(0);

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  const fetchPurchases = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const paginatedResponse = search
        ? await searchPurchaseFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
            search,
          })
        : await getPurchasesFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
          });
      setPurchases(paginatedResponse.rows ?? []);
      setTotal(paginatedResponse.total ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPurchases and closeSideBar are stable
  useEffect(() => {
    void fetchPurchases(page, appliedSearch);

    return () => {
      closeSideBar();
      setSideContent('');
      setPurchasesId('');
    };
  }, [appliedSearch, page, pageSize, showAll]);

  const openSinglePurchase = (id) => {
    setPurchasesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = purchases.map((each) => {
      return (
        <TableRow
          onClick={() => openSinglePurchase(each.id)}
          key={each.id}
          className="cursor-pointer"
        >
          <TableCell>{each.invoiceNumber}</TableCell>
          <TableCell>{each?.supplier?.fullName}</TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.amount)}
          </TableCell>
          <TableCell>{dayjs(each.createdAt).format('DD-MM-YYYY')}</TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return (
        <PurchaseDetail purchaseId={purchaseId} onRefresh={fetchPurchases} />
      );
    }
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    if (value.trim() === '' && appliedSearch !== '') {
      setAppliedSearch('');
      setPage(DEFAULT_PAGE);
    }
  };

  const headerContent = () => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(searchValue.trim());
            setPage(DEFAULT_PAGE);
          }}
        >
          <Input
            placeholder="Search Invoice Number"
            onChange={handleSearchChange}
            value={searchValue}
          />
        </form>
        <Button
          variant="outline"
          onClick={() => {
            void fetchPurchases(page, appliedSearch);
          }}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Purchases"
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
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {purchases.length > 0 ? (
                  renderRows()
                ) : (
                  <TableEmptyRow colSpan={4} message="No purchases found." />
                )}
              </TableBody>
            </Table>
          </TableFrame>
          <PaginationControls
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={onPageSizeChange}
            showAll={showAll}
            onShowAllChange={onShowAllChange}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default AllPurchasesScreen;
