import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Table, Button } from 'semantic-ui-react';
import { useReactToPrint } from 'react-to-print';
import { Link } from 'react-router-dom';
import moment from 'moment';

import {
  deleteInvoiceFn,
  getInvoicesFn,
  getSingleInvoiceFn,
} from '../../../controllers/invoice.controller';
import { numberWithCommas, isAdmin } from '../../../utils/helpers';
import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';
import { closeSideContentFn } from '../../../slices/dashboardSlice';
import routes from '../../../routing/routes';
import { IInvoice } from '../../../models/invoice';

interface SalesDetailProps {
  salesId: number;
}

const SalesDetail: React.FC<SalesDetailProps> = ({
  salesId,
}: SalesDetailProps) => {
  const componentRef = useRef(null);
  const dispatch = useDispatch();

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

  const handleDeleteCustomer = async () => {
    await deleteInvoiceFn(Number(salesId));
    dispatch(closeSideContentFn());
    await getInvoicesFn();
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
    <>
      <Table striped>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Invoice ID</Table.Cell>
            <Table.Cell>{sales.id}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Customer</Table.Cell>
            <Table.Cell>{sales.customer?.fullName}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Type</Table.Cell>
            <Table.Cell>{sales.saleType}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Date</Table.Cell>
            <Table.Cell>
              {moment(sales.createdAt).format('DD/MM/YYYY')}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Time</Table.Cell>
            <Table.Cell>{moment(sales.createdAt).format('h:mm a')}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Amount</Table.Cell>
            <Table.Cell>₦{numberWithCommas(sales.amount)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Profit</Table.Cell>
            <Table.Cell>₦{numberWithCommas(sales.profit)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Posted By</Table.Cell>
            <Table.Cell>{sales.postedBy}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>No</Table.HeaderCell>
            <Table.HeaderCell>Product</Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell>Unit Price</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {sales.products?.map((order, index) => (
            <Table.Row key={order.id}>
              <Table.Cell>{index + 1}</Table.Cell>
              <Table.Cell>{order.title}</Table.Cell>
              <Table.Cell>{order.invoiceItem?.quantity}</Table.Cell>
              <Table.Cell>
                ₦
                {order.invoiceItem?.unitPrice
                  ? numberWithCommas(order.invoiceItem?.unitPrice)
                  : 'N/A'}
              </Table.Cell>
              <Table.Cell>
                ₦
                {order.invoiceItem?.amount
                  ? numberWithCommas(order.invoiceItem?.amount)
                  : 'N/A'}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Button color="green" type="button" onClick={handlePrintFn}>
        Print
      </Button>

      <Button color="yellow" as={Link} to={`${routes.INVOICE}/${salesId}`}>
        Edit
      </Button>
      {isAdmin() ? (
        <Button
          style={{ marginTop: '1rem' }}
          onClick={handleDeleteCustomer}
          type="button"
          negative
        >
          Delete
        </Button>
      ) : null}
      {renderInvoiceToPrint()}
    </>
  );
};

export default SalesDetail;
