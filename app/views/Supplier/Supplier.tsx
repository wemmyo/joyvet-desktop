import React, { useEffect, useRef, useState } from 'react';
import { Table, Form, Button, Icon, Loader } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import CreateSupplier from './components/CreateSupplier/CreateSupplier';
import { numberWithCommas, isAdmin, sum } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditSupplier from './components/EditSupplier/EditSupplier';
import {
  getSuppliersFn,
  createSupplierFn,
  searchSupplierFn,
} from '../../controllers/supplier.controller';
import { ISupplier } from '../../models/supplier';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const SuppliersScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    const response = await getSuppliersFn();
    setSuppliers(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  useEffect(() => {
    fetchSuppliers();

    return () => {
      const closeSideContent = () => {
        dispatch(closeSideContentFn());
        setSideContent('');
        setSupplierId('');
      };
      closeSideContent();
    };
  }, [dispatch]);

  const handleNewSupplier = async (values) => {
    await createSupplierFn(values);
    fetchSuppliers();
  };

  const openSingleSupplier = (id) => {
    setSupplierId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = suppliers.map((each) => {
      return (
        <Table.Row key={each.id} onClick={() => openSingleSupplier(each.id)}>
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
      return <EditSupplier supplierId={Number(supplierId)} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
  };

  useEffect(() => {
    if (searchValue === '') {
      fetchSuppliers();
    }
  }, [searchValue]);

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
        <Button icon labelPosition="left" onClick={fetchSuppliers}>
          <Icon name="redo" />
          Refresh
        </Button>
        <Button onClick={handlePrint} icon="print" />
        <Form
          onSubmit={async () => {
            const response = await searchSupplierFn(searchValue);
            setSuppliers(response);
          }}
        >
          <Form.Input
            placeholder="Search Supplier"
            onChange={handleSearchChange}
            value={searchValue}
          />
        </Form>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Suppliers"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      {loading ? (
        <Loader active inline="centered" />
      ) : (
        <div ref={componentRef}>
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuppliersScreen;
