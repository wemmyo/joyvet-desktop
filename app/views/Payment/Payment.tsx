import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreatePayment from './components/CreatePayment/CreatePayment';
import { numberWithCommas } from '../../utils/helpers';
import PaymentDetail from './components/PaymentDetail/PaymentDetail';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditPayment from './components/EditPayment/EditPayment';
import {
  getPaymentsFn,
  searchPaymentFn,
} from '../../controllers/payment.controller';
import { IPayment } from '../../models/payment';

const CONTENT_CREATE = 'create';
const CONTENT_DETAIL = 'detail';
const CONTENT_EDIT = 'edit';

const PaymentsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchPayments = async () => {
    setLoading(true);
    const response = await getPaymentsFn();
    setPayments(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  useEffect(() => {
    fetchPayments();

    return () => {
      const closeSideContent = () => {
        dispatch(closeSideContentFn());
        setSideContent('');
        setPaymentId('');
      };
      closeSideContent();
    };
  }, [dispatch]);

  const viewPaymentReceipt = (id) => {
    setPaymentId(id);
    openSideContent(CONTENT_DETAIL);
  };

  const renderRows = () => {
    const rows = payments.map((each) => {
      return (
        <Table.Row key={each.id} onClick={() => viewPaymentReceipt(each.id)}>
          <Table.Cell>{each.id}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.amount)}</Table.Cell>
          <Table.Cell>{each.paymentMethod}</Table.Cell>
          <Table.Cell>{each.bank}</Table.Cell>
          <Table.Cell>{moment(each.createdAt).format('DD/MM/YYYY')}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return (
        <PaymentDetail
          paymentId={Number(paymentId)}
          refreshPayments={fetchPayments}
        />
      );
    }
    if (sideContent === CONTENT_CREATE) {
      return <CreatePayment refreshPayments={fetchPayments} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditPayment paymentId={paymentId} />;
    }
    return null;
  };

  const handleSearchChange = async (e, { value }: { value: string }) => {
    setSearchValue(value);
  };

  useEffect(() => {
    if (searchValue.length === 0) {
      fetchPayments();
    }
  }, [searchValue]);

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
        <Button icon labelPosition="left" onClick={fetchPayments}>
          <Icon name="redo" />
          Refresh
        </Button>
        <Form
          onSubmit={async () => {
            setLoading(true);
            const response = await searchPaymentFn(searchValue);
            setPayments(response);
            setLoading(false);
          }}
        >
          <Form.Input
            placeholder="Search Payment"
            onChange={handleSearchChange}
            value={searchValue}
          />
        </Form>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Payments"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {loading ? (
        <Loader active inline="centered" />
      ) : (
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Payment no</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Payment Method</Table.HeaderCell>
              <Table.HeaderCell>Bank</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{renderRows()}</Table.Body>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default PaymentsScreen;
