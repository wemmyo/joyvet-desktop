import React, { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
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
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { numberWithCommas, isAdmin } from '../../utils/helpers';
import { useSidebarContext } from '../../contexts/SidebarContext';
import SalesDetail from './components/SalesDetail';
import {
  filterInvoiceFn,
  filterInvoiceById,
  getInvoicesFn,
} from '../../controllers/invoice.controller';
import { IInvoice } from '../../models/invoice';

const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;
const CONTENT_DETAIL = 'detail';

const SalesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [salesId, setSalesId] = useState<number | undefined>();
  const [saleType, setSaleType] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);

  const { openSideContent: openSideBar, closeSideContent: closeSideBar } =
    useSidebarContext();

  const openSideContent = (content: string) => {
    openSideBar();
    setSideContent(content);
  };

  const fetchInvoices = useCallback(async () => {
    const response = await filterInvoiceFn(startDate, endDate, saleType);
    setInvoices(response);
  }, [startDate, endDate, saleType]);

  useEffect(() => {
    fetchInvoices();

    return () => {
      closeSideBar();
      setSideContent('');
      setSalesId(undefined);
    };
  }, [fetchInvoices]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchValue) {
        const response = await filterInvoiceById(Number(searchValue));
        setInvoices(response);
      }
    };
    fetchData();
  }, [searchValue]);

  const openSingleSale = async (id: number) => {
    setSalesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = invoices.map((each) => {
    return (
      <TableRow
        onClick={() => openSingleSale(each.id)}
        key={each.id}
        className="cursor-pointer hover:bg-muted/50"
      >
        <TableCell>{each.customer?.fullName}</TableCell>
        <TableCell>{each.id}</TableCell>
        <TableCell>{each.saleType}</TableCell>
        <TableCell>₦{numberWithCommas(each.amount)}</TableCell>
        {isAdmin() ? (
          <TableCell>₦{numberWithCommas(each.profit)}</TableCell>
        ) : null}
        <TableCell>{dayjs(each.createdAt).format('DD/MM/YYYY')}</TableCell>
      </TableRow>
    );
  });

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return (
        <SalesDetail salesId={Number(salesId)} onRefresh={fetchInvoices} />
      );
    }
    return null;
  };

  const resetFilters = async () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
    setSaleType('all');
    setSearchValue('');
    await getInvoicesFn();
  };

  const headerContent = () => {
    return (
      <div className="flex items-end gap-2 flex-wrap">
        <Button variant="outline" onClick={resetFilters}>
          Reset
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
            <Input
              id="search"
              placeholder="Invoice number"
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
            />
          </div>
        </div>
      </div>
    );
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfAmount = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices
      .map((item) => {
        return item.amount;
      })
      .reduce(sum);
  };
  const sumOfProfit = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices
      .map((item) => {
        return item.profit;
      })
      .reduce(sum);
  };

  return (
    <DashboardLayout
      screenTitle="Sales"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            {isAdmin() ? <TableHead>Profit</TableHead> : null}
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>{renderRows}</TableBody>
      </Table>
      <div className="mt-2 text-sm font-semibold flex gap-8 justify-end">
        <span>Total: ₦{numberWithCommas(sumOfAmount())}</span>
        {isAdmin() ? (
          <span>Profit Total: ₦{numberWithCommas(sumOfProfit())}</span>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default SalesScreen;
