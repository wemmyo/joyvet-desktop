import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import {
  deleteInvoiceFn,
  getSingleInvoiceFn,
} from '../../../controllers/invoice.controller';
import { numberWithCommas, isAdmin } from '../../../utils/helpers';
import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';
import { useSidebarContext } from '../../../contexts/SidebarContext';
import routes from '../../../routing/routes';
import { IInvoice } from '../../../models/invoice';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/table';
import {
  TableEmptyRow,
  TableFrame,
} from '../../../components/ui/table-helpers';

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

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => setPrintInvoice(false),
  });

  const handlePrintFn = () => {
    setPrintInvoice(true);
  };

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

      setSales(response);
      setLoading(false);
    };
    fetchData();
  }, [salesId]);

  const handleDeleteInvoice = async () => {
    await deleteInvoiceFn(Number(salesId));
    closeSideContent();
    onRefresh?.();
  };

  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return (
        <div style={{ display: 'none' }}>
          <ComponentToPrint ref={componentRef} invoice={sales} />
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
              <TableCell>{dayjs(sales.createdAt).format('DD/MM/YYYY')}</TableCell>
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
