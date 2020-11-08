import React, { useEffect } from 'react';
import { Table } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  selectProductState,
  getProductsFn,
  createProductFn,
} from '../../slices/productSlice';
import CreateProduct from './components/CreateProduct/CreateProduct';
import { numberWithCommas } from '../../utils/helpers';

const ProductsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const productState = useSelector(selectProductState);

  const { data: productsRaw } = productState.products;

  const products = productsRaw ? JSON.parse(productsRaw) : [];

  const fetchProducts = () => {
    dispatch(getProductsFn());
  };

  useEffect(fetchProducts, []);

  const handleNewProduct = (values: any) => {
    dispatch(
      createProductFn(values, () => {
        fetchProducts();
      })
    );
  };

  const renderRows = () => {
    const rows = products.map((each: any) => {
      return (
        <Table.Row key={each.id}>
          <Table.Cell>{each.title}</Table.Cell>
          <Table.Cell>{each.stock}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.unitPrice)}</Table.Cell>
        </Table.Row>
      );
    });
    return rows;
  };

  return (
    <DashboardLayout
      screenTitle="Products"
      rightSidebar={<CreateProduct createProductFn={handleNewProduct} />}
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
