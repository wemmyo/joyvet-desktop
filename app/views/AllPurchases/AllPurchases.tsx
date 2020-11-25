import React, { useEffect, useState } from 'react';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectPurchaseState,
  getPurchasesFn,
  //   createPurchaseFn,
} from '../../slices/purchaseSlice';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import PurchaseDetail from './components/PurchaseDetail';

const CONTENT_DETAIL = 'detail';

const AllPurchasesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [purchaseId, setPurchasesId] = useState('');

  const dispatch = useDispatch();

  const purchaseState = useSelector(selectPurchaseState);

  const { data: purchasesRaw } = purchaseState.purchases;

  const purchases = purchasesRaw ? JSON.parse(purchasesRaw) : [];

  const fetchPurchases = () => {
    dispatch(getPurchasesFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setPurchasesId('');
  };

  // useEffect(fetchPurchases, []);

  useEffect(() => {
    fetchPurchases();

    return () => {
      closeSideContent();
    };
  }, []);

  const openSinglePurchase = (id: any) => {
    setPurchasesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = purchases.map((each: any) => {
      return (
        <Table.Row onClick={() => openSinglePurchase(each.id)} key={each.id}>
          <Table.Cell>{each.invoiceNumber}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return <PurchaseDetail purchaseId={purchaseId} />;
    }
    return null;
  };

  return (
    <DashboardLayout screenTitle="Purchases" rightSidebar={renderSideContent()}>
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Invoice Number</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default AllPurchasesScreen;
