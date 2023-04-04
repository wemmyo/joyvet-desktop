import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreateReceipt from './components/CreateReceipt/CreateReceipt';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditReceipt from './components/EditReceipt/EditReceipt';
import ReceiptDetail from './components/ReceiptDetail/ReceiptDetail';
import { IReceipt } from '../../models/receipt';
import {
  getReceiptsFn,
  searchReceiptFn,
} from '../../controllers/receipt.controller';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';
const CONTENT_DETAIL = 'detail';

const ReceiptsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [receipts, setReceipts] = useState<IReceipt[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchReceipts = async () => {
    setLoading(true);
    const response = await getReceiptsFn();
    setReceipts(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  useEffect(() => {
    fetchReceipts();

    return () => {
      const closeSideContent = () => {
        dispatch(closeSideContentFn());
        setSideContent('');
        setReceiptId('');
      };

      closeSideContent();
    };
  }, [dispatch]);

  const viewSingleReceipt = (id) => {
    setReceiptId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = receipts.map((each) => {
      return (
        <Table.Row key={each.id} onClick={() => viewSingleReceipt(each.id)}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{each.customer?.fullName}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>{each.paymentMethod}</Table.Cell>
          <Table.Cell>{moment(each.createdAt).format('DD/MM/YYYY')}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateReceipt />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditReceipt receiptId={receiptId} />;
    }
    if (sideContent === CONTENT_DETAIL) {
      return <ReceiptDetail receiptId={receiptId} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
    if (value.length > 0) {
      searchReceiptFn(value);
    } else {
      fetchReceipts();
    }
  };

  const headerContent = () => {
    return (
      <>
        <Button
          color="blue"
          icon
          labelPosition="left"
          onClick={() => {
            openSideContent(CONTENT_CREATE);
          }}
        >
          <Icon inverted color="grey" name="add" />
          Create
        </Button>
        <Form.Input
          placeholder="Search Receipt No"
          onChange={handleSearchChange}
          value={searchValue}
        />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Receipts"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {loading ? (
        <Loader active inline="centered" />
      ) : (
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Receipt no</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Payment Method</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{renderRows()}</Table.Body>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default ReceiptsScreen;
