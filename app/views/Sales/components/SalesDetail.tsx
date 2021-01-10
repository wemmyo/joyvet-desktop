/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { useParams } from 'react-router-dom';
import { Table, Button } from 'semantic-ui-react';
import { useReactToPrint } from 'react-to-print';

import {
  getSingleInvoiceFn,
  selectInvoiceState,
  deleteInvoiceFn,
  getInvoicesFn,
} from '../../../slices/invoiceSlice';
import { numberWithCommas } from '../../../utils/helpers';
import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';
import { closeSideContentFn } from '../../../slices/dashboardSlice';

interface SalesDetailProps {
  salesId: string | number;
}

const SalesDetail: React.FC<SalesDetailProps> = ({
  salesId,
}: SalesDetailProps) => {
  const componentRef = useRef();
  const dispatch = useDispatch();

  const [printInvoice, setPrintInvoice] = useState(false);

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
      handlePrint();
    }
  }, [printInvoice]);

  // const handlePrintFn = () => {
  //   dispatch(
  //     getSingleInvoiceFn(salesId, () => {
  //       setPrintInvoice(true);
  //       handlePrint();
  //     })
  //   );
  // };

  const fetchData = () => {
    dispatch(getSingleInvoiceFn(salesId));
  };

  useEffect(fetchData, [salesId]);

  const invoiceState = useSelector(selectInvoiceState);

  const { data: salesRaw, loading } = invoiceState.singleInvoice;

  const sales = salesRaw ? JSON.parse(salesRaw) : {};

  const handleDeleteCustomer = () => {
    dispatch(
      deleteInvoiceFn(salesId, () => {
        dispatch(closeSideContentFn());
        dispatch(getInvoicesFn());
      })
    );
  };

  const renderOrders = () => {
    let serialNumber = 0;
    const orderList = sales.products?.map((order: any) => {
      serialNumber += 1;
      return (
        <Table.Row key={order.id}>
          <Table.Cell>{serialNumber}</Table.Cell>
          <Table.Cell>{order.title}</Table.Cell>
          <Table.Cell>{order.invoiceItem.quantity}</Table.Cell>
          <Table.Cell>
            ₦{numberWithCommas(order.invoiceItem.unitPrice)}
          </Table.Cell>
          <Table.Cell>₦{numberWithCommas(order.invoiceItem.amount)}</Table.Cell>
        </Table.Row>
      );
    });
    return orderList;
  };

  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return (
        <div style={{ display: 'none' }}>
          <ComponentToPrint ref={componentRef} />
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
            <Table.Cell>
              {sales.customer ? sales.customer.fullName : ''}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Type</Table.Cell>
            <Table.Cell>{sales.saleType}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Date</Table.Cell>
            <Table.Cell>
              {new Date(sales.createdAt).toLocaleDateString('en-gb')}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Amount</Table.Cell>
            <Table.Cell>₦{numberWithCommas(sales.amount)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Profit</Table.Cell>
            <Table.Cell>₦{numberWithCommas(sales.profit)}</Table.Cell>
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

        <Table.Body>{renderOrders()}</Table.Body>
      </Table>
      <Button type="button" onClick={handlePrintFn}>
        Print
      </Button>
      <Button
        style={{ marginTop: '1rem' }}
        onClick={handleDeleteCustomer}
        type="button"
        negative
      >
        Delete
      </Button>
      {renderInvoiceToPrint()}
    </>
  );
};

export default SalesDetail;
