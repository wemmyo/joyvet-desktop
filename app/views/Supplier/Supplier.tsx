import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, RefreshCw, Printer } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import PaginationControls from '../../components/PaginationControls/PaginationControls';
import CreateSupplier from './components/CreateSupplier/CreateSupplier';
import { numberWithCommas, isAdmin, sum } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import EditSupplier from './components/EditSupplier/EditSupplier';
import {
  getSuppliersFn,
  createSupplierFn,
  searchSupplierFn,
} from '../../controllers/supplier.controller';
import { ISupplier } from '../../models/supplier';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';
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

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
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

  const renderRows = () => {
    const rows = suppliers.map((each) => {
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

  const sumOfBalances = () => {
    if (suppliers.length === 0) {
      return 0;
    }
    return suppliers
      .map((item: any) => {
        return item.balance;
      })
      .reduce(sum);
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
        <Button variant="outline" size="icon" onClick={handlePrint}>
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
        <div ref={componentRef}>
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
                {suppliers.length > 0 ? (
                  renderRows()
                ) : (
                  <TableEmptyRow colSpan={4} message="No suppliers found." />
                )}
              </TableBody>
              {isAdmin() ? (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">
                      ₦{numberWithCommas(sumOfBalances())}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
          </TableFrame>
          <PaginationControls
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuppliersScreen;
