import React, { useCallback, useEffect, useState } from 'react';
import { Table, Form, Button } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { numberWithCommas, isAdmin } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import SalesDetail from './components/SalesDetail';
import {
  filterInvoiceFn,
  filterInvoiceById,
  getInvoicesFn,
} from '../../controllers/invoice.controller';
import { IInvoice } from '../../models/invoice';

const TODAYS_DATE = `${moment().format('YYYY-MM-DD')}`;
const CONTENT_DETAIL = 'detail';

const SalesScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [salesId, setSalesId] = useState<number | undefined>();
  const [saleType, setSaleType] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState(TODAYS_DATE);
  const [endDate, setEndDate] = useState(TODAYS_DATE);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);

  const dispatch = useDispatch();

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const fetchInvoices = useCallback(async () => {
    const response = await filterInvoiceFn(startDate, endDate, saleType);
    setInvoices(response);
  }, [startDate, endDate, saleType]);

  useEffect(() => {
    fetchInvoices();

    return () => {
      dispatch(closeSideContentFn());
      setSideContent('');
      setSalesId(undefined);
    };
  }, [fetchInvoices, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchValue) {
        const response = await filterInvoiceById(Number(searchValue));
        setInvoices(response);
      }
    };
    fetchData();
  }, [searchValue]);

  const openSingleSale = async (id: number) => {
    setSalesId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = invoices.map((each) => {
    return (
      <Table.Row onClick={() => openSingleSale(each.id)} key={each.id}>
        <Table.Cell>{each.customer?.fullName}</Table.Cell>
        <Table.Cell>{each.id}</Table.Cell>
        <Table.Cell>{each.saleType}</Table.Cell>
        <Table.Cell>₦{numberWithCommas(each.amount)}</Table.Cell>
        {isAdmin() ? (
          <Table.Cell>₦{numberWithCommas(each.profit)}</Table.Cell>
        ) : null}
        <Table.Cell>{moment(each.createdAt).format('DD/MM/YYYY')}</Table.Cell>
      </Table.Row>
    );
  });

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return (
        <SalesDetail salesId={Number(salesId)} onRefresh={fetchInvoices} />
      );
    }
    return null;
  };

  const options = [
    { key: 1, text: 'All', value: 'all' },
    { key: 2, text: 'Transfer', value: 'transfer' },
    { key: 3, text: 'Cash', value: 'cash' },
    { key: 4, text: 'Credit', value: 'credit' },
  ];

  const resetFilters = async () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
    setSaleType('all');
    setSearchValue('');
    await getInvoicesFn();
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
              value={startDate}
            />
            <Form.Input
              label="End Date"
              type="date"
              onChange={(e, { value }) => setEndDate(value)}
              value={endDate}
            />
            <Form.Select
              label="Type"
              options={options}
              placeholder="Choose type"
              onChange={(e, { value }) => setSaleType(value as string)}
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
      .map((item) => {
        return item.amount;
      })
      .reduce(sum);
  };
  const sumOfProfit = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices
      .map((item) => {
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

        <Table.Body>{renderRows}</Table.Body>

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
