import React, { useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSupplierState,
  getSuppliersFn,
  createSupplierFn,
} from '../../slices/supplierSlice';
import CreateSupplier from './components/CreateSupplier/CreateSupplier';
import { numberWithCommas } from '../../utils/helpers';

export interface SuppliersScreenProps {}

const SuppliersScreen: React.FC<SuppliersScreenProps> = () => {
  const dispatch = useDispatch();
  const supplierState = useSelector(selectSupplierState);
  const { data: supplier } = supplierState.supplier;

  const fetchSuppliers = () => {
    dispatch(getSuppliersFn());
  };

  useEffect(fetchSuppliers, []);

  const handleNewSupplier = (values: any) => {
    dispatch(
      createSupplierFn(values, () => {
        fetchSuppliers();
        // console.log('created');
      })
    );
  };

  const renderRows = () => {
    console.log(supplier);
    // return <p>yes</p>;
    const rows = supplier.map((each: any) => {
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
      screenTitle="Suppliers"
      rightSidebar={<CreateSupplier createSupplierFn={handleNewSupplier} />}
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

export default SuppliersScreen;
