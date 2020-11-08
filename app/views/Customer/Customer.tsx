import React, { useEffect } from 'react';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectCustomerState,
  getCustomersFn,
  createCustomerFn,
} from '../../slices/customerSlice';
import CreateCustomer from './components/CreateCustomer/CreateCustomer';
import { numberWithCommas } from '../../utils/helpers';

const CustomersScreen: React.FC = () => {
  const dispatch = useDispatch();

  const customerState = useSelector(selectCustomerState);
  const { data: customersRaw } = customerState.customers;

  const customers = customersRaw ? JSON.parse(customersRaw) : [];

  const fetchCustomers = () => {
    dispatch(getCustomersFn());
  };

  useEffect(fetchCustomers, []);

  const handleNewCustomer = (values: any) => {
    dispatch(
      createCustomerFn(values, () => {
        fetchCustomers();
      })
    );
  };

  const renderRows = () => {
    const rows = customers.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.fullName}</Table.Cell>
          <Table.Cell>{each.address}</Table.Cell>
          <Table.Cell>{each.phoneNumber}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.balance)}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout
      screenTitle="Customers"
      rightSidebar={<CreateCustomer createCustomerFn={handleNewCustomer} />}
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
