import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectInvoiceState,
  getInvoicesFn,
  //   createInvoiceFn,
} from '../../slices/invoiceSlice';
// import CreateInvoice from './components/CreateInvoice/CreateInvoice';
import { numberWithCommas } from '../../utils/helpers';

export interface SalesScreenProps {}

const SalesScreen: React.FC<SalesScreenProps> = () => {
  const dispatch = useDispatch();
  const invoiceState = useSelector(selectInvoiceState);
  const { data: invoices } = invoiceState.invoices;

  const fetchInvoices = () => {
    dispatch(getInvoicesFn());
  };

  useEffect(fetchInvoices, []);

  //   const handleNewInvoice = (values: any) => {
  //     dispatch(
  //       createInvoiceFn(values, () => {
  //         fetchInvoices();
  //         // console.log('created');
  //       })
  //     );
  //   };

  const renderRows = () => {
    console.log(invoices);
    // return <p>yes</p>;
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
