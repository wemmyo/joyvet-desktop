import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CustomerHistoryInvoices from './components/Invoices/Invoices';
import CustomerHistoryReceipts from './components/Receipts/Receipts';
import {
  getCustomerInvoicesFn,
  getCustomerReceiptsFn,
} from '../../controllers/customer.controller';
import { IReceipt } from '../../models/receipt';
import { IInvoice } from '../../models/invoice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const TODAYS_DATE = `${dayjs().format('YYYY-MM-DD')}`;

const CustomerHistory: React.FC = ({ match }: any) => {
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [activeTab, setActiveTab] = useState('Receipts');

  const customerId = match.params.id;

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    const fetchData = async () => {
      const getInvoices = getCustomerInvoicesFn(
        Number(customerId),
        startDate,
        endDate
      );
      const getReceipts = getCustomerReceiptsFn(
        Number(customerId),
        startDate,
        endDate
      );

      const [invoicesResponse, receiptsResponse] = await Promise.all([
        getInvoices,
        getReceipts,
      ]);
      setInvoices(invoicesResponse);
      setReceipts(receiptsResponse);
    };

    fetchData();
  }, [startDate, endDate, customerId]);

  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };

  const tabs = ['Receipts', 'Invoices'];

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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerHistory;
