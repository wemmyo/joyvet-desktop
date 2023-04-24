import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreateCustomer from './components/CreateCustomer/CreateCustomer';
import { numberWithCommas, isAdmin, sum } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditCustomer from './components/EditCustomer/EditCustomer';
import {
  createCustomerFn,
  getCustomersFn,
  searchCustomerFn,
} from '../../controllers/customer.controller';
import { ICustomer } from '../../models/customer';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const CustomersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const fetchCustomers = async () => {
    setLoading(true);
    const response = await getCustomersFn();
    setCustomers(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  useEffect(() => {
    fetchCustomers();

    return () => {
      const closeSideContent = () => {
        dispatch(closeSideContentFn());
        setSideContent('');
        setCustomerId('');
      };
      closeSideContent();
    };
  }, [dispatch]);

  const handleNewCustomer = async (values) => {
    await createCustomerFn(values);
    await fetchCustomers();
  };

  const openSingleCustomer = (id) => {
    setCustomerId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = customers.map((each) => {
      return (
        <Table.Row key={each.id} onClick={() => openSingleCustomer(each.id)}>
          <Table.Cell>{each.fullName}</Table.Cell>
          <Table.Cell>{each.address}</Table.Cell>
          <Table.Cell>{each.phoneNumber}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.balance)}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateCustomer createCustomerFn={handleNewCustomer} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditCustomer customerId={Number(customerId)} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
  };

  useEffect(() => {
    if (searchValue === '') {
      fetchCustomers();
    }
  }, [searchValue]);

  const sumOfBalances = () => {
    if (customers.length === 0) {
      return 0;
    }
    return customers
      .map((item: any) => {
        return item.balance;
      })
      .reduce(sum);
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
        <Form
          onSubmit={async () => {
            const response = await searchCustomerFn(searchValue);
            setCustomers(response);
          }}
        >
          <Form.Input
            placeholder="Search Customer"
            onChange={handleSearchChange}
            value={searchValue}
          />
        </Form>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Customers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {loading ? (
        <Loader active inline="centered" />
      ) : (
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Full Name</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Phone Number</Table.HeaderCell>
              <Table.HeaderCell>Balance</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{renderRows()}</Table.Body>

          {isAdmin() ? (
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell style={{ fontWeight: 'bold' }}>
                  Total: ₦{numberWithCommas(sumOfBalances())}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          ) : null}
        </Table>
      )}
    </DashboardLayout>
  );
};

export default CustomersScreen;
