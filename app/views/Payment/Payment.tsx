import dayjs from 'dayjs';
import { Plus, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

import PaginationControls from '../../components/PaginationControls/PaginationControls';
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
  getPaymentsFn,
  searchPaymentFn,
} from '../../controllers/payment.controller';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import type { IPayment } from '../../models/payment';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { numberWithCommas } from '../../utils/helpers';
import CreatePayment from './components/CreatePayment/CreatePayment';
import EditPayment from './components/EditPayment/EditPayment';
import PaymentDetail from './components/PaymentDetail/PaymentDetail';

const CONTENT_CREATE = 'create';
const CONTENT_DETAIL = 'detail';
const CONTENT_EDIT = 'edit';

const PaymentsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [total, setTotal] = useState(0);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const fetchPayments = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = search
        ? await searchPaymentFn({
            page: nextPage,
            pageSize: DEFAULT_PAGE_SIZE,
            search,
          })
        : await getPaymentsFn({
            page: nextPage,
            pageSize: DEFAULT_PAGE_SIZE,
          });
      setPayments(response.rows ?? []);
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchPayments and closeSideBar are stable
  useEffect(() => {
    void fetchPayments(page, appliedSearch);

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setPaymentId('');
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);

  const viewPaymentReceipt = (id) => {
    setPaymentId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = payments.map((each) => {
      return (
        <TableRow
          key={each.id}
          onClick={() => viewPaymentReceipt(each.id)}
          className="cursor-pointer"
        >
          <TableCell>{each.id}</TableCell>
          <TableCell className="text-right">
            {numberWithCommas(each.amount)}
          </TableCell>
          <TableCell>{each.paymentMethod}</TableCell>
          <TableCell>{each.bank}</TableCell>
          <TableCell>{dayjs(each.createdAt).format('DD/MM/YYYY')}</TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return (
        <PaymentDetail
          paymentId={Number(paymentId)}
          refreshPayments={fetchPayments}
        />
      );
    }
    if (sideContent === CONTENT_CREATE) {
      return <CreatePayment refreshPayments={fetchPayments} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return (
        <EditPayment
          paymentId={paymentId}
          onRefresh={() => fetchPayments(page, appliedSearch)}
        />
      );
    }
    return null;
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            void fetchPayments(page, appliedSearch);
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
            placeholder="Search Payment"
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
      screenTitle="Payments"
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
                  <TableHead>Payment no</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? (
                  renderRows()
                ) : (
                  <TableEmptyRow colSpan={5} message="No payments found." />
                )}
              </TableBody>
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

export default PaymentsScreen;
