/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectCustomerState,
  getCustomersFn,
  createCustomerFn,
  searchCustomerFn,
} from '../../slices/customerSlice';
import CreateCustomer from './components/CreateCustomer/CreateCustomer';
import { numberWithCommas, isAdmin, sum } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditCustomer from './components/EditCustomer/EditCustomer';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const CustomersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const dispatch = useDispatch();

  const customerState = useSelector(selectCustomerState);

  const {
    data: customersRaw,
    loading: customersLoading,
  } = customerState.customers;

  const customers = customersRaw ? JSON.parse(customersRaw) : [];

  const fetchCustomers = () => {
    dispatch(getCustomersFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setCustomerId('');
  };

  useEffect(() => {
    fetchCustomers();

    return () => {
      closeSideContent();
    };
  }, []);

  const handleNewCustomer = (values: any) => {
    dispatch(
      createCustomerFn(values, () => {
        fetchCustomers();
      })
    );
  };

  const openSingleCustomer = (id: any) => {
    setCustomerId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = customers.map((each: any) => {
      return (
        <Table.Row
          key={each.id}
          // eslint-disable-next-line react/jsx-props-no-spreading
          // {...(isAdmin() && { onClick: () => openSingleCustomer(each.id) })}
          onClick={() => openSingleCustomer(each.id)}
        >
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
      return <EditCustomer customerId={customerId} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
    if (value.length > 0) {
      dispatch(searchCustomerFn(value));
    } else {
      fetchCustomers();
    }
  };

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
        <Form.Input
          placeholder="Search Customer"
          onChange={handleSearchChange}
          value={searchValue}
        />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Customers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {customersLoading ? (
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
