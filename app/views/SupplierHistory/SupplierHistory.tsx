import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import SuppplierHistoryPayments from './components/Payments/Payments';
import SuppplierHistoryPurchases from './components/Purchases/Purchases';
import ActivityTimeline from './components/ActivityTimeline/ActivityTimeline';
import {
  getSupplierPaymentsFn,
  getSupplierPurchasesFn,
  getSupplierActivityTimelineFn,
} from '../../controllers/supplier.controller';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;

const SuppplierHistory: React.FC = () => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [payments, setPayments] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Purchases');
  const { id } = useParams<{ id: string }>();
  const supplierId = Number(id);
  const hasValidSupplierId = Number.isInteger(supplierId) && supplierId > 0;

  useEffect(() => {
    if (!hasValidSupplierId) {
      setPayments([]);
      setPurchases([]);
      setActivityTimeline([]);
      return;
    }

    const fetchData = async () => {
      const [paymentsResponse, purchasesResponse, timelineResponse] =
        await Promise.all([
          getSupplierPaymentsFn(supplierId, startDate, endDate),
          getSupplierPurchasesFn(supplierId, startDate, endDate),
          getSupplierActivityTimelineFn(supplierId, startDate, endDate),
        ]);
      setPayments(paymentsResponse || []);
      setPurchases(purchasesResponse || []);
      setActivityTimeline(timelineResponse || []);
    };
    fetchData();
  }, [endDate, hasValidSupplierId, startDate, supplierId]);

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };

  const tabs = ['Purchases', 'Payments', 'Activity'];

  if (!hasValidSupplierId) {
    return (
      <DashboardLayout screenTitle="Supplier History">
        <p className="text-sm text-muted-foreground">
          Invalid supplier selected.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout screenTitle="Supplier History">
      <div className="flex items-end gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      <div>
        <div className="flex border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div>
          {activeTab === 'Purchases' && (
            <SuppplierHistoryPurchases data={purchases} />
          )}
          {activeTab === 'Payments' && (
            <SuppplierHistoryPayments data={payments} />
          )}
          {activeTab === 'Activity' && (
            <ActivityTimeline data={activityTimeline} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuppplierHistory;
