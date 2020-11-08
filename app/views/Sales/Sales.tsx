import React, { useEffect } from 'react';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectInvoiceState,
  getInvoicesFn,
  //   createInvoiceFn,
} from '../../slices/invoiceSlice';
import { numberWithCommas } from '../../utils/helpers';

const SalesScreen: React.FC = () => {
  const dispatch = useDispatch();

  const invoiceState = useSelector(selectInvoiceState);

  const { data: invoicesRaw } = invoiceState.invoices;

  const invoices = invoicesRaw ? JSON.parse(invoicesRaw) : [];

  const fetchInvoices = () => {
    dispatch(getInvoicesFn());
  };

  useEffect(fetchInvoices, []);

  const renderRows = () => {
    const rows = invoices.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{each.saleType}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>
            {new Date(each.createdAt).toLocaleDateString('en-gb')}
          </Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout
      screenTitle="Sales"
      //   rightSidebar={<CreateInvoice createInvoiceFn={handleNewInvoice} />}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Invoice Number</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default SalesScreen;
