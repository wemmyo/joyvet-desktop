/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect } from 'react';
import { Table, Grid, Button, Form, Segment } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  getSuppliersFn,
  selectSupplierState,
} from '../../slices/supplierSlice';
import { getProductsFn, selectProductState } from '../../slices/productSlice';
import { numberWithCommas } from '../../utils/helpers';
import { createPurchaseFn } from '../../slices/purchaseSlice';
import TextInput from '../../components/TextInput/TextInput';

const PurchaseScreen: React.FC = () => {
  const [orders, setOrders] = useState([]);

  const dispatch = useDispatch();
  const supplierState = useSelector(selectSupplierState);
  const productState = useSelector(selectProductState);

  const { data: suppliersRaw } = supplierState.suppliers;
  const { data: productsRaw } = productState.products;

  const suppliers = suppliersRaw ? JSON.parse(suppliersRaw) : [];
  const products = productsRaw ? JSON.parse(productsRaw) : [];

  const fetchSuppliers = () => {
    dispatch(getSuppliersFn());
  };

  const fetchProducts = () => {
    dispatch(getProductsFn());
  };

  const fetchData = () => {
    fetchSuppliers();
    fetchProducts();
  };

  useEffect(fetchData, []);

  const renderProducts = () => {
    const productList = products.map((product: any) => {
      return (
        <option key={product.id} value={JSON.stringify(product)}>
          {product.title}
        </option>
      );
    });
    return productList;
  };

  const renderSuppliers = () => {
    const supplierList = suppliers.map((supplier: any) => {
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

  const addToOrders = (value: any) => {
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
    let serialNumber = 0;
    const orderList = orders.map((order: any) => {
      serialNumber += 1;
      return (
        <Table.Row key={order.orderId}>
          <Table.Cell>{serialNumber}</Table.Cell>
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
                  invoiceDate: '',
                  unitPrice: '',
                  product: '',
                  quantity: '',
                }}
                // validationSchema={CreatePaymentSchema}
                onSubmit={(values) => {
                  addToOrders({
                    ...JSON.parse(values.product),
                    quantity: values.quantity,
                    amount: Number(values.unitPrice) * Number(values.quantity),
                    unitPrice: values.unitPrice,
                    orderId: new Date().getUTCMilliseconds(),
                  });
                  // actions.resetForm({
                  //   values: {
                  //     product: '',
                  //     quantity: '',
                  //   },
                  // });
                }}
              >
                {({ handleSubmit, values, resetForm }) => (
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
                      type="number"
                      component={TextInput}
                    />

                    <Field
                      name="invoiceDate"
                      placeholder="Invoice Date"
                      label="Invoice Date"
                      type="date"
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
                      onClick={() => {
                        dispatch(
                          createPurchaseFn(
                            orders,
                            {
                              supplierId: values.supplierId,
                              invoiceNumber: values.invoiceNumber,
                              invoiceDate: values.invoiceDate,
                              amount: sumOfOrders(),
                            },
                            () => {
                              resetForm();
                              setOrders([]);
                            }
                          )
                        );
                      }}
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
