import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectReceiptState,
  getReceiptsFn,
  createReceiptFn,
} from '../../slices/receiptSlice';
import CreateReceipt from './components/CreateReceipt/CreateReceipt';
import { numberWithCommas } from '../../utils/helpers';

export interface ReceiptsScreenProps {}

const ReceiptsScreen: React.FC<ReceiptsScreenProps> = () => {
  const dispatch = useDispatch();
  const receiptState = useSelector(selectReceiptState);
  const { data: receipt } = receiptState.receipt;

  const fetchReceipts = () => {
    dispatch(getReceiptsFn());
  };

  useEffect(fetchReceipts, []);

  const handleNewReceipt = (values: any) => {
    dispatch(
      createReceiptFn(values, () => {
        fetchReceipts();
        // console.log('created');
      })
    );
  };

  const renderRows = () => {
    console.log(receipt);
    // return <p>yes</p>;
    const rows = receipt.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.fullName}</Table.Cell>
          <Table.Cell>{each.address}</Table.Cell>
          <Table.Cell>{each.phoneNumber}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.balance)}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout
      screenTitle="Receipts"
      rightSidebar={<CreateReceipt createReceiptFn={handleNewReceipt} />}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Supplier Name</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
            <Table.HeaderCell>Posted by</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ReceiptsScreen;
