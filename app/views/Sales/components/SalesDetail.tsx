import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../components/ui/table-helpers';
import { useSidebarContext } from '../../../contexts/SidebarContext';
import {
  deleteInvoiceFn,
  getSingleInvoiceFn,
} from '../../../controllers/invoice.controller';
import { getStoreInfoFn } from '../../../controllers/storeInfo.controller';
import type { IInvoice } from '../../../models/invoice';
import type { IStoreInfo } from '../../../models/storeInfo';
import routes from '../../../routing/routes';
import { isAdmin, numberWithCommas } from '../../../utils/helpers';

interface SalesDetailProps {
  salesId: number;
  // eslint-disable-next-line react/require-default-props
  onRefresh?: () => void;
}

const SalesDetail = ({ salesId, onRefresh }: SalesDetailProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { closeSideContent } = useSidebarContext();

  const [printInvoice, setPrintInvoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<IInvoice>({} as IInvoice);
  const [storeInfo, setStoreInfo] = useState<IStoreInfo | undefined>(undefined);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintInvoice(false),
  });

  const handlePrintFn = () => {
    setPrintInvoice(true);
  };

  useEffect(() => {
    getStoreInfoFn()
      .then((records) => setStoreInfo(records[0]))
      .catch(() => {});
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setPrintInvoice is a stable setter
  useEffect(() => {
    setPrintInvoice(false);
  }, [salesId]);

  useEffect(() => {
    if (printInvoice) {
      handlePrint?.();
    }
  }, [printInvoice, handlePrint]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSingleInvoiceFn(Number(salesId));

      if (response) setSales(response);
      setLoading(false);
    };
    fetchData();
  }, [salesId]);

  const handleDeleteInvoice = async () => {
    try {
      await deleteInvoiceFn(Number(salesId));
      toast.success('Invoice deleted');
      closeSideContent();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete invoice'
      );
    }
  };

  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return (
        <div style={{ display: 'none' }}>
          <ComponentToPrint
            ref={componentRef}
            invoice={sales}
            storeInfo={storeInfo}
          />
        </div>
      );
    }
    return null;
  };

  if (loading || !sales) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-3">
      <TableFrame>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Invoice ID</TableCell>
              <TableCell>{sales.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Customer</TableCell>
              <TableCell>{sales.customer?.fullName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Type</TableCell>
              <TableCell>{sales.saleType}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Date</TableCell>
              <TableCell>
                {dayjs(sales.createdAt).format('DD/MM/YYYY')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Time</TableCell>
              <TableCell>{dayjs(sales.createdAt).format('h:mm a')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Amount</TableCell>
              <TableCell>₦{numberWithCommas(sales.amount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Profit</TableCell>
              <TableCell>₦{numberWithCommas(sales.profit)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Posted By</TableCell>
              <TableCell>{sales.postedBy}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableFrame>

      <TableFrame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sales.products?.length ? (
              sales.products.map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{order.title}</TableCell>
                  <TableCell className="text-right">
                    {order.invoiceItem?.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    ₦
                    {order.invoiceItem?.unitPrice
                      ? numberWithCommas(order.invoiceItem?.unitPrice)
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    ₦
                    {order.invoiceItem?.amount
                      ? numberWithCommas(order.invoiceItem?.amount)
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyRow colSpan={5} message="No sale items found." />
            )}
          </TableBody>
        </Table>
      </TableFrame>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" type="button" onClick={handlePrintFn}>
          Print
        </Button>

        <Button variant="secondary" asChild>
          <Link to={`${routes.INVOICE}/${salesId}`}>Edit</Link>
        </Button>
        {isAdmin() ? (
          <Button
            onClick={handleDeleteInvoice}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        ) : null}
      </div>
      {renderInvoiceToPrint()}
    </div>
  );
};

export default SalesDetail;
