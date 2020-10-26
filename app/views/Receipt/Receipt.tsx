import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectReceiptState, getReceiptsFn } from '../../slices/receiptSlice';
import CreateReceipt from './components/CreateReceipt/CreateReceipt';
import { numberWithCommas } from '../../utils/helpers';

export interface ReceiptsScreenProps {}

const ReceiptsScreen: React.FC<ReceiptsScreenProps> = () => {
  const dispatch = useDispatch();
  const receiptState = useSelector(selectReceiptState);
  const { data: receipts } = receiptState.receipts;

  const fetchReceipts = () => {
    dispatch(getReceiptsFn());
  };

  useEffect(fetchReceipts, []);

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
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout screenTitle="Receipts" rightSidebar={<CreateReceipt />}>
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Receipt no</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Note</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ReceiptsScreen;
