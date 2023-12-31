import React, { useState, useEffect } from 'react';
import { Table, Grid, Button, Form, Segment } from 'semantic-ui-react';
import { Field, Formik } from 'formik';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import TextInput from '../../components/TextInput/TextInput';
import { getSuppliersFn } from '../../controllers/supplier.controller';
import { getProductsFn } from '../../controllers/product.controller';
import { ISupplier } from '../../models/supplier';
import { IProduct } from '../../models/product';
import { numberWithCommas } from '../../utils/helpers';
import { createPurchaseFn } from '../../controllers/purchase.controller';
import { IPurchaseItem } from '../../models/purchaseItem';

const PurchaseScreen: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const getSuppliers = getSuppliersFn();
      const getProducts = getProductsFn();
      const [suppliersResponse, productsResponse] = await Promise.all([
        getSuppliers,
        getProducts,
      ]);
      setSuppliers(suppliersResponse);
      setProducts(productsResponse);
    };
    fetchData();
  }, []);

  const renderProducts = () => {
    const productList = products.map((product) => {
      return (
        <option key={product.id} value={JSON.stringify(product)}>
          {product.title}
        </option>
      );
    });
    return productList;
  };

  const renderSuppliers = () => {
    const supplierList = suppliers.map((supplier) => {
      return (
        <option key={supplier.id} value={supplier.id}>
          {supplier.fullName}
        </option>
      );
    });
    return supplierList;
  };

  const amount = (item: any) => {
    return item.amount;
  };

  const sum = (prev: number, next: number) => {
    return prev + next;
  };

  const addToOrders = (value: IPurchaseItem) => {
    setOrders([...orders, value]);
  };

  const sumOfOrders = () => {
    if (orders.length === 0) {
      return 0;
    }
    return orders.map(amount).reduce(sum);
  };

  const removeOrder = (orderId: number) => {
    const filteredOrders = orders.filter(
      (item: any) => item.orderId !== orderId
    );
    setOrders(filteredOrders);
  };

  const renderOrders = () => {
    const orderList = orders.map((order: any, index) => {
      return (
        <Table.Row key={order.orderId}>
          <Table.Cell>{index + 1}</Table.Cell>
          <Table.Cell>{order.title}</Table.Cell>
          <Table.Cell>{order.quantity}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.unitPrice)}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.amount)}</Table.Cell>
          <Table.Cell>
            <Button
              onClick={() => {
                removeOrder(order.orderId);
              }}
              negative
            >
              Remove
            </Button>
          </Table.Cell>
        </Table.Row>
      );
    });
    return orderList;
  };

  const addItemToOrder = (values, { resetForm }) => {
    addToOrders({
      ...JSON.parse(values.product),
      quantity: values.quantity,
      amount: Number(values.unitPrice) * Number(values.quantity),
      unitPrice: values.unitPrice,
      newSellPrice: values.newSellPrice,
      newSellPrice2: values.newSellPrice2,
      newSellPrice3: values.newSellPrice3,
      orderId: new Date().getUTCMilliseconds(),
    });
    resetForm({
      values: {
        ...values,
        unitPrice: '',
        product: '',
        quantity: '',
        newSellPrice: '',
        newSellPrice2: '',
        newSellPrice3: '',
      },
    });
  };

  const createPurchase = async ({ values, resetForm }) => {
    await createPurchaseFn(orders, {
      supplierId: Number(values.supplierId),
      invoiceNumber: values.invoiceNumber,
      amount: sumOfOrders(),
    });
    resetForm();
    setOrders([]);
  };

  const onProductChange = ({ handleChange, setFieldValue, e }) => {
    handleChange(e);
    setFieldValue('newSellPrice', JSON.parse(e.target.value).sellPrice);
    setFieldValue('newSellPrice2', JSON.parse(e.target.value).sellPrice2);
    setFieldValue('newSellPrice3', JSON.parse(e.target.value).sellPrice3);
  };

  return (
    <DashboardLayout screenTitle="Create Purchase">
      <Grid>
        <Grid.Row>
          <Grid.Column width={11}>
            <h1>Total: ₦{numberWithCommas(sumOfOrders())}</h1>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>No</Table.HeaderCell>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell>Rate</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>{renderOrders()}</Table.Body>

              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>
                    ₦{numberWithCommas(sumOfOrders())}
                  </Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Footer>
            </Table>
          </Grid.Column>
          <Grid.Column width={5}>
            <Segment>
              <Formik
                // enableReinitialize
                initialValues={{
                  supplierId: '',
                  invoiceNumber: '',
                  unitPrice: '',
                  product: '',
                  quantity: '',
                  newSellPrice: '',
                  newSellPrice2: '',
                  newSellPrice3: '',
                }}
                // validationSchema={CreatePaymentSchema}
                onSubmit={addItemToOrder}
              >
                {({
                  handleSubmit,
                  values,
                  resetForm,
                  setFieldValue,
                  handleChange,
                }) => (
                  <Form>
                    <div className="field">
                      <label htmlFor="supplier">Supplier</label>
                      <Field
                        id="supplier"
                        name="supplierId"
                        component="select"
                        className="ui dropdown"
                      >
                        <option value="" disabled hidden>
                          Select Supplier
                        </option>
                        {renderSuppliers()}
                      </Field>
                    </div>
                    <Field
                      name="invoiceNumber"
                      placeholder="Invoice Number"
                      label="Invoice Number"
                      component={TextInput}
                    />
                    <Segment raised>
                      <div className="field">
                        <label htmlFor="product">Item</label>
                        <Field
                          id="product"
                          name="product"
                          component="select"
                          className="ui dropdown"
                          onChange={(e) => {
                            onProductChange({
                              handleChange,
                              setFieldValue,
                              e,
                            });
                          }}
                        >
                          <option value="" disabled hidden>
                            Select Item
                          </option>
                          {renderProducts()}
                        </Field>
                      </div>
                      <Field
                        name="unitPrice"
                        placeholder="Unit Price"
                        label="Unit Price"
                        type="number"
                        component={TextInput}
                      />

                      <Field
                        name="quantity"
                        placeholder="Quantity"
                        label="Quantity"
                        type="number"
                        component={TextInput}
                      />
                      <Field
                        name="newSellPrice"
                        placeholder="Selling Price"
                        label="Selling Price"
                        type="number"
                        component={TextInput}
                      />
                      <Field
                        name="newSellPrice2"
                        placeholder="Selling Price 2"
                        label="Selling Price 2"
                        type="number"
                        component={TextInput}
                      />
                      <Field
                        name="newSellPrice3"
                        placeholder="Selling Price 3"
                        label="Selling Price 3"
                        type="number"
                        component={TextInput}
                      />

                      <Button
                        onClick={() => handleSubmit()}
                        type="Submit"
                        fluid
                        primary
                      >
                        Add Item
                      </Button>
                    </Segment>
                    <Button
                      onClick={() => createPurchase({ values, resetForm })}
                      type="button"
                      fluid
                      positive
                    >
                      Save
                    </Button>
                  </Form>
                )}
              </Formik>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </DashboardLayout>
  );
};

export default PurchaseScreen;
