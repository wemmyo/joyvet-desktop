import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectCustomerState,
  getCustomersFn,
  createCustomerFn,
} from '../../slices/customerSlice';
import CreateCustomer from './components/CreateCustomer/CreateCustomer';
import { numberWithCommas } from '../../utils/helpers';
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

  const dispatch = useDispatch();

  const customerState = useSelector(selectCustomerState);

  const { data: customersRaw } = customerState.customers;

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
        <Table.Row onClick={() => openSingleCustomer(each.id)} key={each.id}>
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

  const headerContent = () => {
    return (
      <>
        <Button icon labelPosition="left">
          <Icon name="filter" />
          Filter
        </Button>
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

        <Input icon="search" placeholder="Search..." />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Customers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Full Name</Table.HeaderCell>
            <Table.HeaderCell>Address</Table.HeaderCell>
            <Table.HeaderCell>Phone Number</Table.HeaderCell>
            <Table.HeaderCell>Outstanding Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default CustomersScreen;
