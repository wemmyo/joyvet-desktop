import React, { useEffect, useState } from 'react';
import { Table, Form, Button } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectInvoiceState,
  getInvoicesFn,
  filterInvoiceByDateFn,
  filterInvoiceBySaleType,
  filterInvoiceById,
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
  const [saleType, setSaleType] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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

  const filterByDate = () => {
    if (startDate && endDate) {
      dispatch(filterInvoiceByDateFn(startDate, endDate));
    }
  };

  const filterByType = () => {
    if (!saleType) {
      return null;
    }
    if (saleType === 'all') {
      dispatch(getInvoicesFn());
    } else {
      dispatch(filterInvoiceBySaleType(saleType));
    }
  };

  const searchForInvoice = () => {
    if (!searchValue) {
      return null;
    }
    dispatch(filterInvoiceById(searchValue));
  };

  useEffect(() => {
    fetchInvoices();

    return () => {
      closeSideContent();
    };
  }, []);

  useEffect(() => {
    filterByDate();
  }, [startDate, endDate]);

  useEffect(() => {
    filterByType();
  }, [saleType]);

  useEffect(() => {
    searchForInvoice();
  }, [searchValue]);

  const openSingleSale = async (id: any) => {
    setSalesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = invoices.map((each: any) => {
      return (
        <Table.Row onClick={() => openSingleSale(each.id)} key={each.id}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{each.saleType}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(each.amount)}</Table.Cell>
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

  const options = [
    { key: 1, text: 'All', value: 'all' },
    { key: 2, text: 'Transfer', value: 'transfer' },
    { key: 3, text: 'Cash', value: 'cash' },
    { key: 4, text: 'Credit', value: 'credit' },
  ];

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    fetchInvoices();
  };

  const headerContent = () => {
    return (
      <>
        <Button onClick={resetFilters}>Reset</Button>

        <Form>
          <Form.Group widths="equal">
            <Form.Input
              label="Start Date"
              type="date"
              onChange={(e, { value }) => setStartDate(value)}
            />
            <Form.Input
              label="End Date"
              type="date"
              onChange={(e, { value }) => setEndDate(value)}
            />
            <Form.Select
              label="Type"
              options={options}
              placeholder="Choose type"
              onChange={(e, { value }) => setSaleType(value)}
              value={saleType}
            />
            <Form.Input
              label="Search"
              placeholder="Search by invoice number"
              onChange={(e, { value }) => setSearchValue(value)}
              value={searchValue}
            />
          </Form.Group>
        </Form>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Sales"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
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
