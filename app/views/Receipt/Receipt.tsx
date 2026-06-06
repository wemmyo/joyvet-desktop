import dayjs from 'dayjs';
import { Plus, RefreshCw } from 'lucide-react';
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
import { useSidebarContext } from '../../contexts/SidebarContext';
import {
  getReceiptsFn,
  searchReceiptFn,
} from '../../controllers/receipt.controller';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import type { IReceipt } from '../../models/receipt';
import { DEFAULT_PAGE } from '../../types/pagination';
import { numberWithCommas } from '../../utils/helpers';
import CreateReceipt from './components/CreateReceipt/CreateReceipt';
import EditReceipt from './components/EditReceipt/EditReceipt';
import ReceiptDetail from './components/ReceiptDetail/ReceiptDetail';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';
const CONTENT_DETAIL = 'detail';

const ReceiptsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    page,
    setPage,
    pageSize,
    showAll,
    onPageSizeChange,
    onShowAllChange,
  } = usePagination();
  const [total, setTotal] = useState(0);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const fetchReceipts = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = search
        ? await searchReceiptFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
            search,
          })
        : await getReceiptsFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
          });
      setReceipts(response.rows ?? []);
      setTotal(response.total ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchReceipts and closeSideBar are stable
  useEffect(() => {
    void fetchReceipts(page, appliedSearch);

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setReceiptId('');
      };

      closeSideContent();
    };
  }, [appliedSearch, page, pageSize, showAll]);

  const viewSingleReceipt = (id) => {
    setReceiptId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = receipts.map((each) => {
      return (
        <TableRow
          key={each.id}
          onClick={() => viewSingleReceipt(each.id)}
          className="cursor-pointer"
        >
          <TableCell>{each.id}</TableCell>
          <TableCell>{each.customer?.fullName}</TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.amount)}
          </TableCell>
          <TableCell>{each.paymentMethod}</TableCell>
          <TableCell>{dayjs(each.createdAt).format('DD/MM/YYYY')}</TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return (
        <CreateReceipt
          onRefresh={() => fetchReceipts(DEFAULT_PAGE, appliedSearch)}
        />
      );
    }
    if (sideContent === CONTENT_EDIT) {
      return (
        <EditReceipt
          receiptId={receiptId}
          onRefresh={() => fetchReceipts(page, appliedSearch)}
        />
      );
    }
    if (sideContent === CONTENT_DETAIL) {
      return <ReceiptDetail receiptId={receiptId} />;
    }
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const headerContent = () => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => {
            openSideContent(CONTENT_CREATE);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Create
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            void fetchReceipts(page, appliedSearch);
          }}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedSearch(searchValue.trim());
            setPage(DEFAULT_PAGE);
          }}
        >
          <Input
            placeholder="Search Receipt No"
            onChange={(event) => {
              handleSearchChange(event);
              if (event.target.value.trim() === '' && appliedSearch !== '') {
                setAppliedSearch('');
                setPage(DEFAULT_PAGE);
              }
            }}
            value={searchValue}
          />
        </form>
      </div>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Receipts"
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
                  <TableHead>Receipt no</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {receipts.length > 0 ? (
                  renderRows()
                ) : (
                  <TableEmptyRow colSpan={5} message="No receipts found." />
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

export default ReceiptsScreen;
