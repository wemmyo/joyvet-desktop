import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectSupplierState,
  getSuppliersFn,
  createSupplierFn,
} from '../../slices/supplierSlice';
import CreateSupplier from './components/CreateSupplier/CreateSupplier';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditSupplier from './components/EditSupplier/EditSupplier';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const SuppliersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const dispatch = useDispatch();

  const supplierState = useSelector(selectSupplierState);

  const { data: suppliersRaw } = supplierState.suppliers;

  const suppliers = suppliersRaw ? JSON.parse(suppliersRaw) : [];

  const fetchSuppliers = () => {
    dispatch(getSuppliersFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setSupplierId('');
  };

  useEffect(() => {
    fetchSuppliers();

    return () => {
      closeSideContent();
    };
  }, []);

  const handleNewSupplier = (values: any) => {
    dispatch(
      createSupplierFn(values, () => {
        fetchSuppliers();
        // console.log('created');
      })
    );
  };

  const openSingleSupplier = (id: any) => {
    setSupplierId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = suppliers.map((each: any) => {
      return (
        <Table.Row onClick={() => openSingleSupplier(each.id)} key={each.id}>
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
      return <CreateSupplier createSupplierFn={handleNewSupplier} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditSupplier supplierId={supplierId} />;
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
      screenTitle="Suppliers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
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
      </Table>
    </DashboardLayout>
  );
};

export default SuppliersScreen;
