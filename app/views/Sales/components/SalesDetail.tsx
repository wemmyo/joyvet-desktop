import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { useParams } from 'react-router-dom';
import { Table } from 'semantic-ui-react';

import {
  getSingleInvoiceFn,
  selectInvoiceState,
} from '../../../slices/invoiceSlice';
import { numberWithCommas } from '../../../utils/helpers';

interface SalesDetailProps {
  salesId: string | number;
}

const SalesDetail: React.FC<SalesDetailProps> = ({
  salesId,
}: SalesDetailProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleInvoiceFn(salesId));
  };

  useEffect(fetchData, [salesId]);

  const invoiceState = useSelector(selectInvoiceState);

  const { data: salesRaw, loading } = invoiceState.singleInvoice;

  const sales = salesRaw ? JSON.parse(salesRaw) : {};

  const renderOrders = () => {
    let serialNumber = 0;
    const orderList = sales.products?.map((order: any) => {
      serialNumber += 1;
      return (
        <Table.Row key={order.id}>
          <Table.Cell>{serialNumber}</Table.Cell>
          <Table.Cell>{order.title}</Table.Cell>
          <Table.Cell>{order.invoiceItem.quantity}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.unitPrice)}</Table.Cell>
        </Table.Row>
      );
    });
    return orderList;
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
            <Table.Cell>{numberWithCommas(sales.amount)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>No</Table.HeaderCell>
            <Table.HeaderCell>Product</Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell>Rate</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderOrders()}</Table.Body>
      </Table>
    </>
  );
};

export default SalesDetail;
