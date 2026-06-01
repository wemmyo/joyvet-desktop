import { Plus, Printer, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import PaginationControls from '../../components/PaginationControls/PaginationControls';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import {
  createSupplierFn,
  getSuppliersFn,
  searchSupplierFn,
} from '../../controllers/supplier.controller';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import type { ISupplier } from '../../models/supplier';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { isAdmin, numberWithCommas } from '../../utils/helpers';
import CreateSupplier from './components/CreateSupplier/CreateSupplier';
import EditSupplier from './components/EditSupplier/EditSupplier';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const SuppliersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [printRows, setPrintRows] = useState<ISupplier[]>([]);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintRows([]),
  });

  const fetchSuppliers = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = search
        ? await searchSupplierFn({
            page: nextPage,
            pageSize: DEFAULT_PAGE_SIZE,
            search,
          })
        : await getSuppliersFn({
            page: nextPage,
            pageSize: DEFAULT_PAGE_SIZE,
          });
      setSuppliers(response.rows ?? []);
      setTotal(response.total ?? 0);
      setBalanceTotal(response.totals?.balance ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch the entire filtered set and print it (all pages, not just the current one).
  const handlePrintAll = async () => {
    try {
      const response = appliedSearch
        ? await searchSupplierFn({
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
            search: appliedSearch,
            all: true,
          })
        : await getSuppliersFn({
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
            all: true,
          });
      setPrintRows(response.rows ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to prepare print');
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handlePrint is stable
  useEffect(() => {
    if (printRows.length > 0) {
      handlePrint?.();
    }
  }, [printRows]);

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchSuppliers and closeSideBar are stable
  useEffect(() => {
    void fetchSuppliers(page, appliedSearch);

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setSupplierId('');
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);

  const handleNewSupplier = async (values) => {
    try {
      await createSupplierFn(values);
      toast.success('Supplier created');
      fetchSuppliers();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create supplier'
      );
    }
  };

  const openSingleSupplier = (id) => {
    setSupplierId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = (list: ISupplier[]) => {
    const rows = list.map((each) => {
      return (
        <TableRow
          key={each.id}
          className="cursor-pointer"
          onClick={() => openSingleSupplier(each.id)}
        >
          <TableCell>{each.fullName}</TableCell>
          <TableCell>{each.address}</TableCell>
          <TableCell>{each.phoneNumber}</TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.balance)}
          </TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  // Shared table markup. `showEmpty` renders the empty-state row when there are
  // no rows (used for the on-screen table; the hidden print table omits it).
  const renderSuppliersTable = (list: ISupplier[], showEmpty: boolean) => (
    <TableFrame>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length > 0 ? (
            renderRows(list)
          ) : showEmpty ? (
            <TableEmptyRow colSpan={4} message="No suppliers found." />
          ) : null}
        </TableBody>
        {isAdmin() ? (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">
                ₦{numberWithCommas(balanceTotal)}
              </TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </TableFrame>
  );

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateSupplier createSupplierFn={handleNewSupplier} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return (
        <EditSupplier
          supplierId={Number(supplierId)}
          onRefresh={() => fetchSuppliers(page, appliedSearch)}
        />
      );
    }
    return null;
  };

  const headerContent = () => {
    return (
      <>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            openSideContent(CONTENT_CREATE);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void fetchSuppliers(page, appliedSearch);
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
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
        <div className="flex gap-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSearch(searchValue.trim());
              setPage(DEFAULT_PAGE);
            }}
          >
            <Input
              placeholder="Search Supplier"
              value={searchValue}
              onChange={(e) => {
                const nextSearchValue = e.target.value;
                setSearchValue(nextSearchValue);
                if (nextSearchValue.trim() === '' && appliedSearch !== '') {
                  setAppliedSearch('');
                  setPage(DEFAULT_PAGE);
                }
              }}
            />
          </form>
        </div>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Suppliers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {error && <p className="text-destructive text-sm p-4">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div>
          {renderSuppliersTable(suppliers, true)}
          <PaginationControls
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
      {/* Hidden full-dataset table used only for printing all pages. */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>{renderSuppliersTable(printRows, false)}</div>
      </div>
    </DashboardLayout>
  );
};

export default SuppliersScreen;
