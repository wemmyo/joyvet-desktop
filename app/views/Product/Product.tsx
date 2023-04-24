import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Icon, Form, Loader } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import CreateProduct from './components/CreateProduct/CreateProduct';
import { numberWithCommas } from '../../utils/helpers';
import {
  openSideContentFn,
  closeSideContentFn,
} from '../../slices/dashboardSlice';
import EditProduct from './components/EditProduct/EditProduct';
import {
  createProductFn,
  getProductsFn,
  searchProductFn,
} from '../../controllers/product.controller';
import { IProduct } from '../../models/product';

const CONTENT_CREATE = 'create';
const CONTENT_EDIT = 'edit';

const ProductsScreen: React.FC = () => {
  const [sideContent, setSideContent] = useState('');
  const [productId, setProductId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const fetchProducts = async () => {
    setLoading(true);
    const response = await getProductsFn();
    setProducts(response);
    setLoading(false);
  };

  const openSideContent = (content: string) => {
    dispatch(openSideContentFn());
    setSideContent(content);
  };

  useEffect(() => {
    fetchProducts();

    return () => {
      const closeSideContent = () => {
        dispatch(closeSideContentFn());
        setSideContent('');
        setProductId('');
      };
      closeSideContent();
    };
  }, [dispatch]);

  const handleNewProduct = async (values: any) => {
    await createProductFn(values);
    await fetchProducts();
  };

  const openSingleProduct = (id: any) => {
    setProductId(id);
    openSideContent(CONTENT_EDIT);
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const sumOfStockValue = () => {
    if (products.length === 0) {
      return 0;
    }
    return products
      .map((item) => {
        return item.stock * item.buyPrice;
      })
      .reduce(sum);
  };

  const renderRows = () => {
    const rows = products.map((each) => {
      return (
        <Table.Row onClick={() => openSingleProduct(each.id)} key={each.id}>
          <Table.Cell>{each.title}</Table.Cell>
          <Table.Cell>{each.stock}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.buyPrice)}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.sellPrice)}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.sellPrice2)}</Table.Cell>
          <Table.Cell>{numberWithCommas(each.sellPrice3)}</Table.Cell>
          <Table.Cell>
            {numberWithCommas(each.stock * each.buyPrice)}
          </Table.Cell>
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
  };

  useEffect(() => {
    if (searchValue === '') {
      fetchProducts();
    }
  }, [searchValue]);

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
        <Button onClick={handlePrint} icon="print" />
        <Form
          onSubmit={async () => {
            const response = await searchProductFn(searchValue);
            setProducts(response);
          }}
        >
          <Form.Input
            placeholder="Search Product"
            onChange={handleSearchChange}
            value={searchValue}
          />
        </Form>
      </>
    );
  };

  return (
    <DashboardLayout
      screenTitle="Products"
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
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Buy Price</Table.HeaderCell>
                <Table.HeaderCell>Sell Price</Table.HeaderCell>
                <Table.HeaderCell>Sell Price 2</Table.HeaderCell>
                <Table.HeaderCell>Sell Price 3</Table.HeaderCell>
                <Table.HeaderCell>Stock Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>{renderRows()}</Table.Body>

            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell style={{ fontWeight: 'bold' }}>
                  Total: ₦{numberWithCommas(sumOfStockValue())}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProductsScreen;
