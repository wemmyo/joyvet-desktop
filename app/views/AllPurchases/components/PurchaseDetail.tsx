import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
import { Table, Button } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';

import { numberWithCommas } from '../../../utils/helpers';
import { closeSideContentFn } from '../../../slices/dashboardSlice';
import { IPurchase } from '../../../models/purchase';
import {
  deletePurchaseFn,
  getPurchasesFn,
  getSinglePurchaseFn,
} from '../../../controllers/purchase.controller';

interface SalesDetailProps {
  purchaseId: string | number;
}

const SalesDetail: React.FC<SalesDetailProps> = ({
  purchaseId,
}: SalesDetailProps) => {
  const [purchase, setPurchase] = useState<IPurchase[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSinglePurchaseFn(Number(purchaseId));
      setPurchase(response);
      setLoading(false);
    };
    fetchData();
  }, [purchaseId]);

  const handleDelete = async () => {
    await deletePurchaseFn(purchaseId);
    await getPurchasesFn();
    dispatch(closeSideContentFn());
  };

  const renderOrders = () => {
    let serialNumber = 0;
    const orderList = purchase.products?.map((order: any) => {
      serialNumber += 1;
      return (
        <Table.Row key={order.id}>
          <Table.Cell>{serialNumber}</Table.Cell>
          <Table.Cell>{order.title}</Table.Cell>
          <Table.Cell>{order.purchaseItem.quantity}</Table.Cell>
          <Table.Cell>
            ₦{numberWithCommas(order.purchaseItem.unitPrice)}
          </Table.Cell>
          <Table.Cell>
            ₦{numberWithCommas(order.purchaseItem.amount)}
          </Table.Cell>
        </Table.Row>
      );
    });
    return orderList;
  };

  if (loading || !purchase) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Table striped>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Invoice Number</Table.Cell>
            <Table.Cell>{purchase.invoiceNumber}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Supplier</Table.Cell>
            <Table.Cell>{purchase.supplier?.fullName}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Amount</Table.Cell>
            <Table.Cell>{numberWithCommas(purchase.amount)}</Table.Cell>
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
            <Table.HeaderCell>Unit Price</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderOrders()}</Table.Body>
      </Table>
      <Button onClick={() => handleDelete()} type="Submit" negative>
        Delete
      </Button>
    </>
  );
};

export default SalesDetail;
