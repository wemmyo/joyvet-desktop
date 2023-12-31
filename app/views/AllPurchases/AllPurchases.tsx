import React, { useEffect, useState } from 'react';
import { Table, Form, Loader, Button, Icon } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import PurchaseDetail from './components/PurchaseDetail';
import { IPurchase } from '../../models/purchase';
import {
  getPurchasesFn,
  searchPurchaseFn,
} from '../../controllers/purchase.controller';

const CONTENT_DETAIL = 'detail';

const AllPurchasesScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [sideContent, setSideContent] = useState('');
  const [purchaseId, setPurchasesId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<IPurchase[]>([]);

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const fetchPurchases = async () => {
    const response = await getPurchasesFn();
    setPurchases(response);
  };

  useEffect(() => {
    fetchPurchases();

    return () => {
      dispatch(closeSideContentFn());
      setSideContent('');
      setPurchasesId('');
    };
  }, [dispatch]);

  const openSinglePurchase = (id) => {
    setPurchasesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = purchases.map((each) => {
      return (
        <Table.Row onClick={() => openSinglePurchase(each.id)} key={each.id}>
          <Table.Cell>{each.invoiceNumber}</Table.Cell>
          <Table.Cell>{each?.supplier?.fullName}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>{moment(each.createdAt).format('DD-MM-YYYY')}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const searchPurchase = async (value) => {
    setLoading(true);
    const response = await searchPurchaseFn(value);
    setPurchases(response);
    setLoading(false);
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return <PurchaseDetail purchaseId={purchaseId} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
    if (value.length > 0) {
      searchPurchase(value);
    } else {
      fetchPurchases();
    }
  };

  const headerContent = () => {
    return (
      <>
        <Form.Input
          placeholder="Search Invoice Number"
          onChange={handleSearchChange}
          value={searchValue}
        />
        <Button icon labelPosition="left" onClick={fetchPurchases}>
          <Icon name="redo" />
          Refresh
        </Button>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Purchases"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {loading ? (
        <Loader active inline="centered" />
      ) : (
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Invoice Number</Table.HeaderCell>
              <Table.HeaderCell>Supplier</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{renderRows()}</Table.Body>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default AllPurchasesScreen;
