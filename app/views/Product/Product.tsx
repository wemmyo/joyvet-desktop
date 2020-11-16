import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectProductState,
  getProductsFn,
  createProductFn,
} from '../../slices/productSlice';
import CreateProduct from './components/CreateProduct/CreateProduct';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditProduct from './components/EditProduct/EditProduct';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const ProductsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [productId, setProductId] = useState('');

  const dispatch = useDispatch();
  const productState = useSelector(selectProductState);

  const { data: productsRaw } = productState.products;

  const products = productsRaw ? JSON.parse(productsRaw) : [];

  const fetchProducts = () => {
    dispatch(getProductsFn());
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  const closeSideContent = () => {
    dispatch(closeSideContentFn());
    setSideContent('');
    setProductId('');
  };

  useEffect(() => {
    fetchProducts();

    return () => {
      closeSideContent();
    };
  }, []);

  const handleNewProduct = (values: any) => {
    dispatch(
      createProductFn(values, () => {
        fetchProducts();
      })
    );
  };

  const openSingleProduct = (id: any) => {
    setProductId(id);
    openSideContent(CONTENT_EDIT);
  };

  const renderRows = () => {
    const rows = products.map((each: any) => {
      return (
        <Table.Row onClick={() => openSingleProduct(each.id)} key={each.id}>
          <Table.Cell>{each.title}</Table.Cell>
          <Table.Cell>{each.stock}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.unitPrice)}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateProduct createProductFn={handleNewProduct} />;
    } else if (sideContent === CONTENT_EDIT) {
      return <EditProduct productId={productId} />;
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
      screenTitle="Products"
      rightSidebar={renderSideContent()}
      // rightSidebar={<CreateProduct createProductFn={handleNewProduct} />}
      headerContent={headerContent()}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Stock</Table.HeaderCell>
            <Table.HeaderCell>Price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ProductsScreen;
