import React, { useEffect, useState } from 'react';
import { Table, Button, Icon, Form } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectProductState,
  getProductsFn,
  createProductFn,
  searchProductFn,
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
  const [searchValue, setSearchValue] = useState('');

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
          <Table.Cell>{numberWithCommas(each.price1)}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.price2)}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.price3)}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.price4)}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return <CreateProduct createProductFn={handleNewProduct} />;
    }
    if (sideContent === CONTENT_EDIT) {
      return <EditProduct productId={productId} />;
    }
    return null;
  };

  const handleSearchChange = (e, { value }: { value: string }) => {
    setSearchValue(value);
    if (value.length > 0) {
      dispatch(searchProductFn(value));
    } else {
      fetchProducts();
    }
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
          placeholder="Search Product"
          onChange={handleSearchChange}
          value={searchValue}
        />
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Products"
      rightSidebar={renderSideContent()}
      headerContent={headerContent()}
    >
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell>Price 1</Table.HeaderCell>
            <Table.HeaderCell>Price 2</Table.HeaderCell>
            <Table.HeaderCell>Price 3</Table.HeaderCell>
            <Table.HeaderCell>Price 4</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{renderRows()}</Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ProductsScreen;
