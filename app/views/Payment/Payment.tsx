import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Plus, RefreshCw } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreatePayment from './components/CreatePayment/CreatePayment';
import { numberWithCommas } from '../../utils/helpers';
import PaymentDetail from './components/PaymentDetail/PaymentDetail';
import { useSidebarContext } from '../../contexts/SidebarContext';
import EditPayment from './components/EditPayment/EditPayment';
import {
  getPaymentsFn,
  searchPaymentFn,
} from '../../controllers/payment.controller';
import { IPayment } from '../../models/payment';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

const CONTENT_CREATE = 'create';
const CONTENT_DETAIL = 'detail';
const CONTENT_EDIT = 'edit';

const PaymentsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(false);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const fetchPayments = async () => {
    setLoading(true);
    const response = await getPaymentsFn();
    setPayments(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    fetchPayments();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setPaymentId('');
      };
      closeSideContent();
    };
  }, []);

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
          className="cursor-pointer hover:bg-muted/50"
        >
          <TableCell>{each.id}</TableCell>
          <TableCell>{numberWithCommas(each.amount)}</TableCell>
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
      return <EditPayment paymentId={paymentId} />;
    }
    return null;
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (searchValue.length === 0) {
      fetchPayments();
    }
  }, [searchValue]);

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
        <Button variant="outline" onClick={fetchPayments}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const response = await searchPaymentFn(searchValue);
            setPayments(response);
            setLoading(false);
          }}
        >
          <Input
            placeholder="Search Payment"
            onChange={handleSearchChange}
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
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment no</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderRows()}</TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default PaymentsScreen;
