import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Icon, Loader } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectSupplierState,
  getSuppliersFn,
  createSupplierFn,
  searchSupplierFn,
  clearSingleSupplierFn,
} from '../../slices/supplierSlice';
import CreateSupplier from './components/CreateSupplier/CreateSupplier';
import { numberWithCommas, isAdmin } from '../../utils/helpers';
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
  const [searchValue, setSearchValue] = useState('');

  const dispatch = useDispatch();

  const supplierState = useSelector(selectSupplierState);

  const {
    data: suppliersRaw,
    loading: suppliersLoading,
  } = supplierState.suppliers;

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
      dispatch(clearSingleSupplierFn());
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
        <Table.Row
          key={each.id}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...(isAdmin() && { onClick: () => openSingleSupplier(each.id) })}
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
      return <CreateSupplier createSupplierFn={handleNewSupplier} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditSupplier supplierId={supplierId} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
    if (value.length > 0) {
      dispatch(searchSupplierFn(value));
    } else {
      fetchSuppliers();
    }
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfBalances = () => {
    if (suppliers.length === 0) {
      return 0;
    }
    return suppliers
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
          placeholder="Search Supplier"
          onChange={handleSearchChange}
          value={searchValue}
        />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Suppliers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {suppliersLoading ? (
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

          {isAdmin ? (
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

export default SuppliersScreen;
