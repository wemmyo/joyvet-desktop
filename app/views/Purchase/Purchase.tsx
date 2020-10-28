import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { Table, Grid, Button, Form, Segment } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import {
  getSuppliersFn,
  selectSupplierState,
} from '../../slices/supplierSlice';
import { getProductsFn, selectProductState } from '../../slices/productSlice';
import { numberWithCommas } from '../../utils/helpers';
import { createPurchaseFn } from '../../slices/purchaseSlice';

export interface PurchaseProps {}

const PurchaseScreen: React.SFC<PurchaseProps> = () => {
  const [orders, setOrders]: any = useState([]);

  const dispatch = useDispatch();
  const supplierState = useSelector(selectSupplierState);
  const { data: suppliers } = supplierState.suppliers;
  const productState = useSelector(selectProductState);
  const { data: products } = productState.products;

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

  const removeOrder = (id: number) => {
    const filteredOrders = orders.filter((item: any) => item.id !== id);
    setOrders(filteredOrders);
  };

  const renderOrders = () => {
    let serialNumber = 1;
    const orderList = orders.map((order: any) => {
      return (
        <Table.Row key={serialNumber}>
          <Table.Cell>{serialNumber++}</Table.Cell>
          <Table.Cell>{order.title}</Table.Cell>
          <Table.Cell>{order.quantity}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.unitPrice)}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.amount)}</Table.Cell>
          <Table.Cell>
            <Button
              onClick={() => {
                removeOrder(serialNumber);
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
                  <Table.HeaderCell></Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>
                    ₦{numberWithCommas(sumOfOrders())}
                  </Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
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
                  product: '',
                  quantity: '',
                }}
                // validationSchema={CreatePaymentSchema}
                onSubmit={(values, actions) => {
                  console.log(values);

                  addToOrders({
                    ...JSON.parse(values.product),
                    quantity: values.quantity,
                    amount:
                      JSON.parse(values.product).unitPrice *
                      Number(values.quantity),
                  });
                  // actions.resetForm({
                  //   values: {
                  //     product: '',
                  //     quantity: '',
                  //   },
                  // });
                }}
              >
                {({ handleSubmit, values }) => (
                  <Form>
                    <div className="field">
                      <label>Supplier</label>
                      <Field
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
                        <label>Item</label>
                        <Field
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
                          createPurchaseFn(orders, {
                            supplierId: values.supplierId,
                            invoiceNumber: values.invoiceNumber,
                            invoiceDate: values.invoiceDate,
                            amount: sumOfOrders(),
                          })
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
      {/* <Divider vertical>And</Divider> */}
    </DashboardLayout>
  );
};

export default PurchaseScreen;

const TextInput = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}: {
  [x: string]: any;
  field: any;
  form: any;
}) => {
  return (
    <Form.Input
      error={
        touched[field.name] && errors[field.name] ? errors[field.name] : false
      }
      label={props.label}
    >
      <input placeholder={props.placeholder} {...field} {...props} />
    </Form.Input>
  );
};
