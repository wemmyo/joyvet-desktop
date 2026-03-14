import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Plus, RefreshCw } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreateReceipt from './components/CreateReceipt/CreateReceipt';
import { numberWithCommas } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import EditReceipt from './components/EditReceipt/EditReceipt';
import ReceiptDetail from './components/ReceiptDetail/ReceiptDetail';
import { IReceipt } from '../../models/receipt';
import {
  getReceiptsFn,
  searchReceiptFn,
} from '../../controllers/receipt.controller';
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
const CONTENT_EDIT = 'edit';
const CONTENT_DETAIL = 'detail';

const ReceiptsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const fetchReceipts = async () => {
    setLoading(true);
    const response = await getReceiptsFn();
    setReceipts(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  useEffect(() => {
    fetchReceipts();

    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent('');
        setReceiptId('');
      };

      closeSideContent();
    };
  }, []);

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
          className="cursor-pointer hover:bg-muted/50"
        >
          <TableCell>{each.id}</TableCell>
          <TableCell>{each.customer?.fullName}</TableCell>
          <TableCell>{numberWithCommas(each.amount)}</TableCell>
          <TableCell>{each.paymentMethod}</TableCell>
          <TableCell>{dayjs(each.createdAt).format('DD/MM/YYYY')}</TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateReceipt />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditReceipt receiptId={receiptId} />;
    }
    if (sideContent === CONTENT_DETAIL) {
      return <ReceiptDetail receiptId={receiptId} />;
    }
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (searchValue.length === 0) {
      fetchReceipts();
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
        <Button variant="outline" onClick={fetchReceipts}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const response = await searchReceiptFn(searchValue);
            setReceipts(response);
            setLoading(false);
          }}
        >
          <Input
            placeholder="Search Receipt No"
            onChange={handleSearchChange}
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
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt no</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>{renderRows()}</TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default ReceiptsScreen;
