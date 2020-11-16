import React, { useEffect, useState } from 'react';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectInvoiceState,
  getInvoicesFn,
  //   createInvoiceFn,
} from '../../slices/invoiceSlice';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import SalesDetail from './components/SalesDetail';

const CONTENT_DETAIL = 'detail';

const SalesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [salesId, setSalesId] = useState('');

  const dispatch = useDispatch();

  const invoiceState = useSelector(selectInvoiceState);

  const { data: invoicesRaw } = invoiceState.invoices;

  const invoices = invoicesRaw ? JSON.parse(invoicesRaw) : [];

  const fetchInvoices = () => {
    dispatch(getInvoicesFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setSalesId('');
  };

  // useEffect(fetchInvoices, []);

  useEffect(() => {
    fetchInvoices();

    return () => {
      closeSideContent();
    };
  }, []);

  const openSingleSale = (id: any) => {
    setSalesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = invoices.map((each: any) => {
      return (
        <Table.Row onClick={() => openSingleSale(each.id)} key={each.id}>
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

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return <SalesDetail salesId={salesId} />;
    }
    return null;
  };

  return (
    <DashboardLayout screenTitle="Sales" rightSidebar={renderSideContent()}>
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
