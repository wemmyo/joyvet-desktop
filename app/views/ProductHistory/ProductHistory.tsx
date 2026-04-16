import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

import ProductHistoryInvoices from './components/Invoices/Invoices';
import ProductHistoryPurchases from './components/Purchases/Purchases';
import AuditLog from './components/AuditLog/AuditLog';
import {
  getProductInvoicesFn,
  getProductPurchasesFn,
  getProductAuditLogFn,
} from '../../controllers/product.controller';

const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;

const ProductHistory: React.FC = () => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [activeTab, setActiveTab] = useState<
    'purchases' | 'invoices' | 'auditLog'
  >('purchases');
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const hasValidProductId = Number.isInteger(productId) && productId > 0;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  useEffect(() => {
    if (!hasValidProductId) {
      setInvoices([]);
      setPurchases([]);
      setAuditLog([]);
      return;
    }

    const fetchData = async () => {
      const [invoicesResponse, purchasesResponse, auditLogResponse] =
        await Promise.all([
          getProductInvoicesFn(productId, startDate, endDate),
          getProductPurchasesFn(productId, startDate, endDate),
          getProductAuditLogFn(productId, startDate, endDate),
        ]);
      setInvoices(invoicesResponse || []);
      setPurchases(purchasesResponse || []);
      setAuditLog(auditLogResponse || []);
    };
    fetchData();
  }, [endDate, hasValidProductId, productId, startDate]);

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };

  if (!hasValidProductId) {
    return (
      <DashboardLayout screenTitle="Product History">
        <p className="text-sm text-muted-foreground">
          Invalid product selected.
        </p>
      </DashboardLayout>
    );
  }

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
          {(
            [
              { key: 'purchases', label: 'Purchases' },
              { key: 'invoices', label: 'Invoices' },
              { key: 'auditLog', label: 'Audit Log' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'purchases' && (
          <ProductHistoryPurchases data={purchases} />
        )}
        {activeTab === 'invoices' && <ProductHistoryInvoices data={invoices} />}
        {activeTab === 'auditLog' && <AuditLog data={auditLog} />}
      </div>
    </DashboardLayout>
  );
};

export default ProductHistory;
