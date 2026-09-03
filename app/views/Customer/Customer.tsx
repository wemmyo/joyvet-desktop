import { Plus, Printer, RefreshCw, Search } from 'lucide-react';
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
  createCustomerFn,
  getCustomersFn,
  searchCustomerFn,
} from '../../controllers/customer.controller';
import { usePagination } from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import type { ICustomer } from '../../models/customer';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { isAdmin, numberWithCommas } from '../../utils/helpers';
import CreateCustomer from './components/CreateCustomer/CreateCustomer';
import EditCustomer from './components/EditCustomer/EditCustomer';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const CustomersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [customers, setCustomers] = useState<ICustomer[]>([]);
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
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [printRows, setPrintRows] = useState<ICustomer[]>([]);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintRows([]),
  });

  const fetchCustomers = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = search
        ? await searchCustomerFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
            search,
          })
        : await getCustomersFn({
            page: nextPage,
            pageSize,
            all: showAll || undefined,
          });
      setCustomers(response.rows ?? []);
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
        ? await searchCustomerFn({
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
            search: appliedSearch,
            all: true,
          })
        : await getCustomersFn({
            page: DEFAULT_PAGE,
            pageSize: DEFAULT_PAGE_SIZE,
            all: true,
          });
      setPrintRows(response.rows ?? []);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to prepare print'
      );
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchCustomers and closeSideBar are stable
  useEffect(() => {
    void fetchCustomers(page, appliedSearch);

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setCustomerId('');
      };
      closeSideContent();
    };
  }, [appliedSearch, page, pageSize, showAll]);

  const handleNewCustomer = async (values: Partial<ICustomer>) => {
    const customer = await createCustomerFn(values);
    if (!customer) {
      return undefined;
    }

    closeSideBar();
    setSideContent('');
    setCustomerId('');

    const name = customer.fullName;
    const alreadyShowing = appliedSearch === name && page === DEFAULT_PAGE;
    setSearchValue(name);
    setAppliedSearch(name);
    setPage(DEFAULT_PAGE);
    if (alreadyShowing) {
      await fetchCustomers(DEFAULT_PAGE, name);
    }
    return customer;
  };

  const openSingleCustomer = (id) => {
    setCustomerId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = (list: ICustomer[]) => {
    const rows = list.map((each) => {
      return (
        <TableRow
          key={each.id}
          className="cursor-pointer"
          onClick={() => openSingleCustomer(each.id)}
        >
          <TableCell>{each.fullName}</TableCell>
          <TableCell>{each.address}</TableCell>
          <TableCell>{each.phoneNumber}</TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.balance ?? 0)}
          </TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  // Shared table markup. `showEmpty` renders the empty-state row when there are
  // no rows (used for the on-screen table; the hidden print table omits it).
  const renderCustomersTable = (list: ICustomer[], showEmpty: boolean) => (
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
            <TableEmptyRow colSpan={4} message="No customers found." />
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
      return <CreateCustomer createCustomerFn={handleNewCustomer} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return (
        <EditCustomer
          customerId={Number(customerId)}
          onRefresh={() => fetchCustomers(page, appliedSearch)}
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
            void fetchCustomers(page, appliedSearch);
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
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(searchValue.trim());
            setPage(DEFAULT_PAGE);
          }}
        >
          <Input
            placeholder="Search name or phone"
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
          <Button type="submit" variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Customers"
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
          {renderCustomersTable(customers, true)}
          <PaginationControls
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={onPageSizeChange}
            showAll={showAll}
            onShowAllChange={onShowAllChange}
          />
        </div>
      )}
      {/* Hidden full-dataset table used only for printing all pages. */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>{renderCustomersTable(printRows, false)}</div>
      </div>
    </DashboardLayout>
  );
};

export default CustomersScreen;
