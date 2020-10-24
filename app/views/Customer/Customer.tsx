import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCustomerState,
  getCustomersFn,
  createCustomerFn,
} from '../../slices/customerSlice';
import CreateCustomer from './components/CreateCustomer/CreateCustomer';
import { numberWithCommas } from '../../utils/helpers';

export interface CustomersScreenProps {}

const CustomersScreen: React.FC<CustomersScreenProps> = () => {
  const dispatch = useDispatch();
  const customerState = useSelector(selectCustomerState);
  const { data: customers } = customerState.customers;

  const fetchCustomers = () => {
    dispatch(getCustomersFn());
  };

  useEffect(fetchCustomers, []);

  const handleNewCustomer = (values: any) => {
    dispatch(
      createCustomerFn(values, () => {
        fetchCustomers();
        // console.log('created');
      })
    );
  };

  const renderRows = () => {
    console.log(customers);
    // return <p>yes</p>;
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
