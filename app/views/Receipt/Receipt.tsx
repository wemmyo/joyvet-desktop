import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import {
  selectReceiptState,
  getReceiptsFn,
  createReceiptFn,
} from '../../slices/receiptSlice';
import CreateReceipt from './components/CreateReceipt/CreateReceipt';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditReceipt from './components/EditReceipt/EditReceipt';
import ReceiptDetail from './components/ReceiptDetail/ReceiptDetail';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';
const CONTENT_DETAIL = 'detail';

const ReceiptsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [receiptId, setReceiptId] = useState('');

  const dispatch = useDispatch();

  const receiptState = useSelector(selectReceiptState);

  const { data: receiptsRaw } = receiptState.receipts;
  const receipts = receiptsRaw ? JSON.parse(receiptsRaw) : [];

  const fetchReceipts = () => {
    dispatch(getReceiptsFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setReceiptId('');
  };

  useEffect(() => {
    fetchReceipts();

    return () => {
      closeSideContent();
    };
  }, []);

  const handleNewReceipt = (values: any) => {
    dispatch(
      createReceiptFn(values, () => {
        fetchReceipts();
      })
    );
  };

  const viewSingleReceipt = (id: any) => {
    setReceiptId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const editSingleReceipt = (id: any) => {
    setReceiptId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = receipts.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
          <Table.Cell>{each.note}</Table.Cell>
          <Table.Cell
            style={{ cursor: 'pointer' }}
            onClick={() => viewSingleReceipt(each.id)}
          >
            View
          </Table.Cell>
          <Table.Cell
            style={{ cursor: 'pointer', color: 'red' }}
            onClick={() => editSingleReceipt(each.id)}
          >
            Edit
          </Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateReceipt createReceiptFn={handleNewReceipt} />;
    } else if (sideContent === CONTENT_EDIT) {
      return <EditReceipt receiptId={receiptId} />;
    } else if (sideContent === CONTENT_DETAIL) {
      return <ReceiptDetail receiptId={receiptId} />;
    }
    return null;
  };

  const headerContent = () => {
    return (
      <>
        <Button icon labelPosition="left">
          <Icon name="filter" />
          Filter
        </Button>
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

        <Input icon="search" placeholder="Search..." />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Receipts"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Receipt no</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
            <Table.HeaderCell />
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ReceiptsScreen;
