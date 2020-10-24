import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectPurchaseState,
  getPurchasesFn,
  createPurchaseFn,
} from '../../slices/purchaseSlice';
import CreatePurchase from './components/CreatePurchase/CreatePurchase';

export interface PurchasesScreenProps {}

const PurchasesScreen: React.FC<PurchasesScreenProps> = () => {
  const dispatch = useDispatch();
  const purchaseState = useSelector(selectPurchaseState);
  const { data: purchase } = purchaseState.purchase;

  const fetchPurchases = () => {
    dispatch(getPurchasesFn());
  };

  useEffect(fetchPurchases, []);

  const handleNewPurchase = (values: any) => {
    dispatch(
      createPurchaseFn(values, () => {
        fetchPurchases();
        // console.log('created');
      })
    );
  };

  const renderRows = () => {
    console.log(purchase);
    // return <p>yes</p>;
    const rows = purchase.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.title}</Table.Cell>
          <Table.Cell>{each.stock}</Table.Cell>
          <Table.Cell>{each.unitPrice}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout
      screenTitle="Purchases"
      rightSidebar={<CreatePurchase createPurchaseFn={handleNewPurchase} />}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Stock</Table.HeaderCell>
            <Table.HeaderCell>Price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default PurchasesScreen;
