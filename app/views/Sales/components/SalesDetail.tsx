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

interface SalesDetailProps {
  salesId: number;
  // eslint-disable-next-line react/require-default-props
  onRefresh?: () => void;
}

const SalesDetail = ({ salesId, onRefresh }: SalesDetailProps) => {
  const componentRef = useRef(null);
  const { closeSideContent } = useSidebarContext();

  const [printInvoice, setPrintInvoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<IInvoice>({} as IInvoice);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sales.products?.map((order, index) => (
            <TableRow key={order.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{order.title}</TableCell>
              <TableCell>{order.invoiceItem?.quantity}</TableCell>
              <TableCell>
                ₦
                {order.invoiceItem?.unitPrice
                  ? numberWithCommas(order.invoiceItem?.unitPrice)
                  : 'N/A'}
              </TableCell>
              <TableCell>
                ₦
                {order.invoiceItem?.amount
                  ? numberWithCommas(order.invoiceItem?.amount)
                  : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
