/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import { Table, Form, Button } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectInvoiceState,
  getInvoicesFn,
  filterInvoiceById,
  filterInvoiceFn,
  //   createInvoiceFn,
} from '../../slices/invoiceSlice';
import { numberWithCommas, isAdmin } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import SalesDetail from './components/SalesDetail';

const START_DATE = `${moment().format('YYYY-MM-DD')}`;
const END_DATE = `${moment().add(1, 'days').format('YYYY-MM-DD')}`;
const CONTENT_DETAIL = 'detail';

const SalesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [salesId, setSalesId] = useState('');
  const [saleType, setSaleType] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState(START_DATE);
  const [endDate, setEndDate] = useState(END_DATE);

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

  const filterSales = () => {
    dispatch(filterInvoiceFn(startDate, endDate, saleType));
  };

  const searchForInvoice = () => {
    if (searchValue) {
      dispatch(filterInvoiceById(searchValue));
    } else if (searchValue.length === 0) {
      fetchInvoices();
    }
  };

  useEffect(() => {
    filterSales();

    return () => {
      closeSideContent();
    };
  }, [startDate, endDate, saleType]);

  useEffect(() => {
    if (searchValue.length > 0) {
      searchForInvoice();
    }
  }, [searchValue]);

  const openSingleSale = async (id: any) => {
    setSalesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = invoices.map((each: any) => {
      return (
        <Table.Row onClick={() => openSingleSale(each.id)} key={each.id}>
          <Table.Cell>{each.customer?.fullName}</Table.Cell>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{each.saleType}</Table.Cell>
          <Table.Cell>₦{numberWithCommas(each.amount)}</Table.Cell>
          {isAdmin() ? (
            <Table.Cell>₦{numberWithCommas(each.profit)}</Table.Cell>
          ) : null}
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
    setStartDate(START_DATE);
    setEndDate(END_DATE);
    setSaleType('all');
    setSearchValue('');
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
              placeholder="Invoice number"
              onChange={(e, { value }) => setSearchValue(value)}
              value={searchValue}
            />
          </Form.Group>
        </Form>
      </>
    );
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfAmount = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices
      .map((item: any) => {
        return item.amount;
      })
      .reduce(sum);
  };
  const sumOfProfit = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices
      .map((item: any) => {
        return item.profit;
      })
      .reduce(sum);
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
            <Table.HeaderCell>Customer</Table.HeaderCell>
            <Table.HeaderCell>Invoice Number</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            {isAdmin() ? <Table.HeaderCell>Profit</Table.HeaderCell> : null}
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell />
            <Table.HeaderCell />
            <Table.HeaderCell style={{ fontWeight: 'bold' }}>
              Total: ₦{numberWithCommas(sumOfAmount())}
            </Table.HeaderCell>
            {isAdmin() ? (
              <Table.HeaderCell style={{ fontWeight: 'bold' }}>
                Total: ₦{numberWithCommas(sumOfProfit())}
              </Table.HeaderCell>
            ) : null}
            <Table.HeaderCell />
          </Table.Row>
        </Table.Footer>
      </Table>
    </DashboardLayout>
  );
};

export default SalesScreen;
