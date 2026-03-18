import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { useParams } from 'react-router-dom';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CustomerHistoryInvoices from './components/Invoices/Invoices';
import CustomerHistoryReceipts from './components/Receipts/Receipts';
import ActivityTimeline from './components/ActivityTimeline/ActivityTimeline';
import {
  getCustomerInvoicesFn,
  getCustomerReceiptsFn,
  getCustomerActivityTimelineFn,
} from '../../controllers/customer.controller';
import { IReceipt } from '../../models/receipt';
import { IInvoice } from '../../models/invoice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;

const CustomerHistory: React.FC = () => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Receipts');
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const hasValidCustomerId = Number.isInteger(customerId) && customerId > 0;

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    if (!hasValidCustomerId) {
      setInvoices([]);
      setReceipts([]);
      setActivityTimeline([]);
      return;
    }

    const fetchData = async () => {
      const [invoicesResponse, receiptsResponse, timelineResponse] =
        await Promise.all([
          getCustomerInvoicesFn(customerId, startDate, endDate),
          getCustomerReceiptsFn(customerId, startDate, endDate),
          getCustomerActivityTimelineFn(customerId, startDate, endDate),
        ]);
      setInvoices(invoicesResponse || []);
      setReceipts(receiptsResponse || []);
      setActivityTimeline(timelineResponse || []);
    };

    fetchData();
  }, [customerId, endDate, hasValidCustomerId, startDate]);

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };

  const tabs = ['Receipts', 'Invoices', 'Activity'];

  if (!hasValidCustomerId) {
    return (
      <DashboardLayout screenTitle="Customer History">
        <p className="text-sm text-muted-foreground">
          Invalid customer selected.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout screenTitle="Customer History">
      <div ref={componentRef}>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <div className="flex items-end gap-3">
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
          </div>
          <Button variant="outline" onClick={resetFilters} className="self-end">
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
            {activeTab === 'Receipts' && (
              <CustomerHistoryReceipts data={receipts} />
            )}
            {activeTab === 'Invoices' && (
              <CustomerHistoryInvoices data={invoices} />
            )}
            {activeTab === 'Activity' && (
              <ActivityTimeline data={activityTimeline} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerHistory;
