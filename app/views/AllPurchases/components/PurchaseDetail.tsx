import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { useParams } from 'react-router-dom';
import { Table } from 'semantic-ui-react';

import {
  getSinglePurchaseFn,
  selectPurchaseState,
} from '../../../slices/purchaseSlice';
import { numberWithCommas } from '../../../utils/helpers';

interface SalesDetailProps {
  purchaseId: string | number;
}

const SalesDetail: React.FC<SalesDetailProps> = ({ purchaseId }) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSinglePurchaseFn(purchaseId));
  };

  useEffect(fetchData, [purchaseId]);

  const purchaseState = useSelector(selectPurchaseState);

  const { data: purchaseRaw } = purchaseState.singlePurchase;

  const purchase = purchaseRaw ? JSON.parse(purchaseRaw) : {};

  const renderOrders = () => {
    let serialNumber = 0;
    const orderList = purchase.products?.map((order: any) => {
      serialNumber += 1;
      return (
        <Table.Row key={order.id}>
          <Table.Cell>{serialNumber}</Table.Cell>
          <Table.Cell>{order.title}</Table.Cell>
          <Table.Cell>{order.purchaseItem.quantity}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.unitPrice)}</Table.Cell>
        </Table.Row>
      );
    });
    return orderList;
  };

  return (
    <>
      <Table striped>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Invoice Number</Table.Cell>
            <Table.Cell>{purchase.invoiceNumber}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Customer</Table.Cell>
            <Table.Cell>{purchase.supplier?.fullName}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Type</Table.Cell>
            <Table.Cell>Test</Table.Cell>
            {/* <Table.Cell>{purchase.saleType}</Table.Cell> */}
          </Table.Row>
          <Table.Row>
            <Table.Cell>Amount</Table.Cell>
            <Table.Cell>{numberWithCommas(purchase.amount)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Invoice Date</Table.Cell>
            <Table.Cell>
              {new Date(purchase.invoiceDate).toLocaleDateString('en-gb')}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Date Posted</Table.Cell>
            <Table.Cell>
              {new Date(purchase.createdAt).toLocaleDateString('en-gb')}
            </Table.Cell>
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
