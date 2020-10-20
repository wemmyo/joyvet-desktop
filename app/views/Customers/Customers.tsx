import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCustomerState,
  getCustomersFn,
} from '../../slices/customerSlice';

export interface CustomersScreenProps {}

const CustomersScreen: React.FC<CustomersScreenProps> = () => {
  const dispatch = useDispatch();
  const customerState = useSelector(selectCustomerState);
  const { data: customers } = customerState.customers;

  const fetchCustomers = () => {
    dispatch(getCustomersFn());
  };

  useEffect(fetchCustomers, []);

  const renderRows = () => {
    console.log(customers);
    // return <p>yes</p>;
    const rows = customers.map((each: any) => {
      return (
        <Table.Row>
          <Table.Cell>{each.cust_company_name}</Table.Cell>
          <Table.Cell>{each.address}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };
  return (
    <DashboardLayout screenTitle="Customers">
      <Table striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Address</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default CustomersScreen;
