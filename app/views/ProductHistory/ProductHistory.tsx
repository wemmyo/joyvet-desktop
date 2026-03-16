import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

import ProductHistoryInvoices from './components/Invoices/Invoices';
import ProductHistoryPurchases from './components/Purchases/Purchases';
import {
  getProductInvoicesFn,
  getProductPurchasesFn,
} from '../../controllers/product.controller';

// export interface ProductHistoryProps {}

const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;

const ProductHistory: React.FC = () => {
  const { id: productId } = useParams<{ id: string }>();
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [activeTab, setActiveTab] = useState<'purchases' | 'invoices'>(
    'purchases'
  );

  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const getInvoices = getProductInvoicesFn(
        Number(productId),
        startDate,
        endDate
      );
      const getReceipts = getProductPurchasesFn(
        Number(productId),
        startDate,
        endDate
      );

      const [invoicesResponse, receiptsResponse] = await Promise.all([
        getInvoices,
        getReceipts,
      ]);
      setInvoices(invoicesResponse);
      setPurchases(receiptsResponse);
    };
    fetchData();
  }, [startDate, endDate, productId]);

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };

  return (
    <DashboardLayout screenTitle="Product History">
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-4">
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
        </div>
        <Button variant="outline" onClick={resetFilters} className="mt-5">
          Reset
        </Button>
      </div>

      <div>
        <div className="flex border-b mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'purchases'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Purchases
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invoices'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Invoices
          </button>
        </div>

        {activeTab === 'purchases' && (
          <ProductHistoryPurchases data={purchases} />
        )}
        {activeTab === 'invoices' && <ProductHistoryInvoices data={invoices} />}
      </div>
    </DashboardLayout>
  );
};

export default ProductHistory;
