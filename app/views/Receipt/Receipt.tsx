import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import {
  selectReceiptState,
  getReceiptsFn,
  searchReceiptFn,
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
  const [searchValue, setSearchValue] = useState('');

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

  const viewSingleReceipt = (id: any) => {
    setReceiptId(id);
    openSideContent(CONTENT_DETAIL);
  };

  // const editSingleReceipt = (id: any) => {
  //   setReceiptId(id);
  //   openSideContent(CONTENT_EDIT);
  // };

  const renderRows = () => {
    const rows = receipts.map((each: any) => {
      return (
        <Table.Row key={each.id} onClick={() => viewSingleReceipt(each.id)}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{each.customer.fullName}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>{each.paymentType}</Table.Cell>
          <Table.Cell>{each.paymentMethod}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
          {/* <Table.Cell
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
          </Table.Cell> */}
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
      dispatch(searchReceiptFn(value));
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
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Receipt no</Table.HeaderCell>
            <Table.HeaderCell>Customer</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Payment Method</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ReceiptsScreen;
