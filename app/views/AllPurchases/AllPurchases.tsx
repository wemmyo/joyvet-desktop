import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { RefreshCw } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
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

import { numberWithCommas } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import PurchaseDetail from './components/PurchaseDetail';
import { IPurchase } from '../../models/purchase';
import {
  getPurchasesFn,
  searchPurchaseFn,
} from '../../controllers/purchase.controller';

const CONTENT_DETAIL = 'detail';

const AllPurchasesScreen: React.FC = () => {
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();
  const [sideContent, setSideContent] = useState('');
  const [purchaseId, setPurchasesId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<IPurchase[]>([]);

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  const fetchPurchases = async () => {
    const response = await getPurchasesFn();
    setPurchases(response);
  };

  useEffect(() => {
    fetchPurchases();

    return () => {
      closeSideBar();
      setSideContent('');
      setPurchasesId('');
    };
  }, []);

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
          className="cursor-pointer hover:bg-muted/50"
        >
          <TableCell>{each.invoiceNumber}</TableCell>
          <TableCell>{each?.supplier?.fullName}</TableCell>
          <TableCell>{numberWithCommas(each.amount)}</TableCell>
          <TableCell>{dayjs(each.createdAt).format('DD-MM-YYYY')}</TableCell>
        </TableRow>
      );
    });
    return rows;
  };

  const searchPurchase = async (value) => {
    setLoading(true);
    const response = await searchPurchaseFn(value);
    setPurchases(response);
    setLoading(false);
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return <PurchaseDetail purchaseId={purchaseId} />;
    }
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    if (value.length > 0) {
      searchPurchase(value);
    } else {
      fetchPurchases();
    }
  };

  const headerContent = () => {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search Invoice Number"
          onChange={handleSearchChange}
          value={searchValue}
        />
        <Button variant="outline" onClick={fetchPurchases}>
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
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>{renderRows()}</TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default AllPurchasesScreen;
