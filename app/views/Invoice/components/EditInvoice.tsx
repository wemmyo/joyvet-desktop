/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect, useRef } from 'react';
import { Table, Grid, Button, Form, Segment } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';

import DashboardLayout from '../../../layouts/DashboardLayout/DashboardLayout';
import {
  getCustomersFn,
  selectCustomerState,
} from '../../../slices/customerSlice';
import {
  getProductsFn,
  selectProductState,
} from '../../../slices/productSlice';
import { numberWithCommas } from '../../../utils/helpers';
import {
  getSingleInvoiceFn,
  selectInvoiceState,
  deleteInvoiceItemFn,
  addInvoiceItemFn,
} from '../../../slices/invoiceSlice';
import TextInput from '../../../components/TextInput/TextInput';
import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';

const EditInvoiceScreen: React.FC = ({ match }: any) => {
  const invoiceId = match.params.id;

  const componentRef = useRef();
  const dispatch = useDispatch();

  const [printInvoice, setPrintInvoice] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const customerState = useSelector(selectCustomerState);
  const productState = useSelector(selectProductState);
  const invoiceState = useSelector(selectInvoiceState);
  // const invoiceState = useSelector(selectInvoiceState);

  const { data: customersRaw } = customerState.customers;
  const { data: productsRaw } = productState.products;
  const { data: singleInvoiceRaw } = invoiceState.singleInvoice;
  // const { data: createdInvoiceRaw } = invoiceState.createInvoiceState;

  const customers = customersRaw ? JSON.parse(customersRaw) : [];
  const products = productsRaw ? JSON.parse(productsRaw) : [];
  const singleInvoice = singleInvoiceRaw ? JSON.parse(singleInvoiceRaw) : {};
  // console.log(createdInvoice);

  interface FormValues {
    customerId: string;
    saleType: string;
    product: string;
    unitPrice: string;
    quantity: string;
  }

  const fetchCustomers = () => {
    dispatch(getCustomersFn());
  };

  const fetchProducts = () => {
    dispatch(getProductsFn('inStock'));
  };

  const fetchSingleInvoice = () => {
    dispatch(getSingleInvoiceFn(invoiceId));
  };

  const fetchData = () => {
    fetchCustomers();
    fetchProducts();
    fetchSingleInvoice();
  };

  const handlePrintFn = () => {
    setPrintInvoice(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (printInvoice) {
      handlePrint();
    }
  }, [printInvoice]);

  const renderProducts = ({
    handleChange,
    setFieldValue,
  }: {
    handleChange: (e: React.ChangeEvent<any>) => void;
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean
    ) => void;
  }) => {
    const productList = products.map((product: any) => {
      return (
        <option key={product.id} value={JSON.stringify(product)}>
          {product.title}
        </option>
      );
    });

    return (
      <div className="field">
        <label htmlFor="product">Product</label>
        <Field
          id="product"
          name="product"
          component="select"
          className="ui dropdown"
          onChange={(e) => {
            handleChange(e);
            setFieldValue('unitPrice', '');
          }}
        >
          <option value="" disabled hidden>
            Select Product
          </option>
          {productList}
        </Field>
      </div>
    );
  };

  const renderPrices = (value: any) => {
    if (!value) {
      return null;
    }

    const product = JSON.parse(value);
    const productPrices = [
      { label: 'Level 1', value: product.sellPrice },
      { label: 'Level 2', value: product.sellPrice2 },
      { label: 'Level 3', value: product.sellPrice3 },
      { label: 'Level 4', value: product.buyPrice },
    ];

    const productPriceList = productPrices.map((price) => {
      return (
        <option key={price.label} value={price.value}>
          {`${price.label}: ₦${numberWithCommas(price.value)}`}
        </option>
      );
    });
    return (
      <div className="field">
        <label htmlFor="unitPrice">Product</label>
        <Field
          id="unitPrice"
          name="unitPrice"
          component="select"
          className="ui dropdown"
        >
          <option value="" disabled hidden>
            Select Price
          </option>
          {productPriceList}
        </Field>
      </div>
    );
  };

  const renderCustomers = () => {
    const customerList = customers.map((customer: any) => {
      return (
        <option key={customer.id} value={customer.id}>
          {customer.fullName}
        </option>
      );
    });
    return customerList;
  };

  const removeOrder = ({
    productId,
    invoiceItemId,
  }: {
    productId: string | number;
    invoiceItemId: string | number;
  }) => {
    dispatch(
      deleteInvoiceItemFn({
        productId,
        invoiceId,
        invoiceItemId,
        cb: () => {
          fetchSingleInvoice();
        },
      })
    );
  };

  const renderOrders = () => {
    if (!singleInvoiceRaw) {
      return null;
    }

    let serialNumber = 0;
    const orderList = singleInvoice.products.map((order: any) => {
      serialNumber += 1;
      return (
        <Table.Row key={order.id}>
          <Table.Cell>{serialNumber}</Table.Cell>
          <Table.Cell>{order.title}</Table.Cell>
          <Table.Cell>{order.invoiceItem.quantity}</Table.Cell>
          <Table.Cell>
            {numberWithCommas(order.invoiceItem.unitPrice)}
          </Table.Cell>
          <Table.Cell>{numberWithCommas(order.invoiceItem.amount)}</Table.Cell>
          <Table.Cell>
            <Button
              onClick={() => {
                removeOrder({
                  productId: order.id,
                  invoiceItemId: order.invoiceItem.id,
                });
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

  const addItemToOrder = (values: FormValues, { resetForm }) => {
    const product = JSON.parse(values.product);
    const amount = Number(values.unitPrice) * Number(values.quantity);
    const profit =
      (Number(values.unitPrice) - Number(product.buyPrice)) *
      Number(values.quantity);

    if (product.stock < Number(values.quantity)) {
      toast.error(`${product.title}: Re-order level`, {
        autoClose: 5000,
      });
      resetForm({
        values: {
          ...values,
          quantity: '',
          unitPrice: '',
          product: '',
        },
      });
    } else {
      dispatch(
        addInvoiceItemFn({
          invoiceId,
          productId: product.id,
          quantity: Number(values.quantity),
          amount,
          unitPrice: Number(values.unitPrice),
          profit,
          cb: () => fetchSingleInvoice(),
        })
      );

      resetForm({
        values: {
          ...values,
          quantity: '',
          unitPrice: '',
          product: '',
        },
      });
    }
  };

  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return (
        <div style={{ display: 'none' }}>
          <ComponentToPrint ref={componentRef} />
        </div>
      );
    }
    return null;
  };

  const disabledAdditem = () => {
    const invoiceDate = moment(singleInvoice.createdAt).format('DD/MM/YYYY');
    const todaysDate = moment().format('DD/MM/YYYY');

    if (invoiceDate === todaysDate) {
      return false;
    }
    return true;
  };

  return (
    <DashboardLayout screenTitle={`Edit Invoice ${invoiceId}`}>
      <Grid>
        <Grid.Row>
          <Grid.Column width={11}>
            <h1>Total: ₦{numberWithCommas(singleInvoice.amount)}</h1>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>No</Table.HeaderCell>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell>Unit Price</Table.HeaderCell>
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
                    ₦{numberWithCommas(singleInvoice.amount)}
                  </Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Footer>
            </Table>
          </Grid.Column>
          <Grid.Column width={5}>
            <Segment>
              <Formik
                initialValues={{
                  customerId: singleInvoice.customer.id || '',
                  saleType: singleInvoice.saleType || '',
                  product: '',
                  unitPrice: '',
                  quantity: '',
                }}
                // validationSchema={CreatePaymentSchema}
                onSubmit={addItemToOrder}
              >
                {({ handleSubmit, handleChange, values, setFieldValue }) => (
                  <Form>
                    <div className="field">
                      <label htmlFor="customer">Customer</label>
                      <Field
                        id="customer"
                        name="customerId"
                        component="select"
                        className="ui dropdown"
                        disabled
                      >
                        <option value="" disabled hidden>
                          Select Customer
                        </option>
                        {renderCustomers()}
                      </Field>
                    </div>
                    <div className="field">
                      <label htmlFor="saleType">Sale Type</label>
                      <Field
                        id="saleType"
                        name="saleType"
                        component="select"
                        className="ui dropdown"
                        disabled
                      >
                        <option value="" disabled hidden>
                          Select Sale
                        </option>
                        <option value="cash">Cash Sales</option>
                        <option value="credit">Credit Sales</option>
                        <option value="transfer">Transfer</option>
                      </Field>
                    </div>
                    <Segment raised>
                      {renderProducts({
                        handleChange,
                        setFieldValue,
                      })}
                      {renderPrices(values.product)}
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
                        disabled={disabledAdditem()}
                      >
                        Add Item
                      </Button>
                    </Segment>
                    <Button
                      onClick={handlePrintFn}
                      type="button"
                      fluid
                      positive
                    >
                      Print
                    </Button>
                    {renderInvoiceToPrint()}
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

export default withRouter(EditInvoiceScreen);
