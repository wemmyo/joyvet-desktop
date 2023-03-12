/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Table, Grid, Button, Form, Segment } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import {
  getCustomersFn,
  selectCustomerState,
  getSingleCustomerFn,
} from '../../slices/customerSlice';
import { getProductsFn, selectProductState } from '../../slices/productSlice';
import { numberWithCommas, sum } from '../../utils/helpers';
import {
  createInvoiceFn,
  getSingleInvoiceFn,
  selectInvoiceState,
} from '../../slices/invoiceSlice';
import TextInput from '../../components/TextInput/TextInput';
import ComponentToPrint from '../../components/PrintedReceipt/ReceiptWrapper';
import { IProduct } from '../../models/product';
import { IInvoiceItem } from '../../models/invoiceItem';

const InvoiceScreen: React.FC = () => {
  const componentRef = useRef(null);
  const dispatch = useDispatch();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [orders, setOrders] = useState<IInvoiceItem[]>([]);
  const [printInvoice, setPrintInvoice] = useState(false);

  const customerState = useSelector(selectCustomerState);
  const productState = useSelector(selectProductState);
  const invoiceState = useSelector(selectInvoiceState);

  const { data: singleCustomer } = customerState.singleCustomer;
  const { data: customers } = customerState.customers;
  const { data: products } = productState.products;
  const { data: createdInvoice } = invoiceState.createInvoice;

  useEffect(() => {
    dispatch(getCustomersFn());
    dispatch(getProductsFn('inStock'));
  }, [dispatch]);

  useEffect(() => {
    if (createdInvoice) {
      dispatch(
        getSingleInvoiceFn(createdInvoice.id, () => {
          handlePrint?.();
        })
      );
    }
  }, [createdInvoice, dispatch, handlePrint]);

  // const renderProducts = ({
  //   handleChange,
  //   setFieldValue,
  // }: {
  //   handleChange: (e: React.ChangeEvent<any>) => void;
  //   setFieldValue: (
  //     field: string,
  //     value: any,
  //     shouldValidate?: boolean
  //   ) => void;
  // }) => {
  //   const productList = products.map((product: any) => {
  //     return (
  //       <option key={product.id} value={product}>
  //         {product.title}
  //       </option>
  //     );
  //   });

  //   return (
  //     <div className="field">
  //       <label htmlFor="product">Product</label>
  //       <Field
  //         id="product"
  //         name="product"
  //         component="select"
  //         className="ui dropdown"
  //         onChange={(e: React.ChangeEvent<any>) => {
  //           handleChange(e);
  //           setFieldValue('unitPrice', '');
  //         }}
  //       >
  //         <option value="" disabled hidden>
  //           Select Product
  //         </option>
  //         {productList}
  //       </Field>
  //     </div>
  //   );
  // };

  const renderPrices = (product: IProduct) => {
    if (!product) {
      return null;
    }

    interface IProductPrice {
      label: string;
      value: number;
      priceLevel: number;
    }

    const productPrices = [
      { label: 'Level 1', value: product.sellPrice, priceLevel: 1 },
      { label: 'Level 2', value: product.sellPrice2, priceLevel: 2 },
      { label: 'Level 3', value: product.sellPrice3, priceLevel: 3 },
      { label: 'Level 4', value: product.buyPrice, priceLevel: 4 },
    ];

    let filteredPriceLevel: IProductPrice[] = [];

    if (singleCustomer?.maxPriceLevel) {
      const availablePrices = productPrices.filter(
        (price) => singleCustomer.maxPriceLevel >= price.priceLevel
      );
      filteredPriceLevel = availablePrices;
    } else {
      const defaultPrices = productPrices.filter(
        (price) => price.priceLevel <= 2
      );
      filteredPriceLevel = defaultPrices;
    }

    const productPriceList = filteredPriceLevel.map((price) => {
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
    const customerList = customers.map((customer) => {
      return (
        <option key={customer.id} value={customer.id}>
          {customer.fullName}
        </option>
      );
    });
    return customerList;
  };

  const addToOrders = (newOrder: IInvoiceItem) => {
    setOrders([...orders, newOrder]);
  };

  const sumOfOrders = () => {
    if (orders.length === 0) {
      return 0;
    }
    return orders
      .map((item) => {
        return item.amount;
      })
      .reduce(sum);
  };

  const sumOfProfits = () => {
    return orders
      .map((item) => {
        return item.profit;
      })
      .reduce(sum);
  };

  const removeOrder = (orderId: number) => {
    const filteredOrders = orders.filter((item) => item.id !== orderId);
    setOrders(filteredOrders);
  };

  const renderOrders = () => {
    // console.log(orders);

    let serialNumber = 0;
    const orderList = orders.map((order) => {
      serialNumber += 1;
      return (
        <Table.Row key={order.id}>
          <Table.Cell>{serialNumber}</Table.Cell>
          <Table.Cell>{order['product?.title']}</Table.Cell>
          <Table.Cell>{order.quantity}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.unitPrice)}</Table.Cell>
          <Table.Cell>{numberWithCommas(order.amount)}</Table.Cell>
          <Table.Cell>
            <Button
              onClick={() => {
                removeOrder(order.id);
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

  const resetAddItemForm = (resetForm, values) => {
    resetForm({
      values: {
        ...values,
        quantity: '',
        unitPrice: '',
        product: '',
      },
    });
  };

  type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

  type IInvoiceItemWithProduct = WithRequired<IInvoiceItem, 'product'>;

  const addItemToOrder = (values: IInvoiceItemWithProduct, { resetForm }) => {
    const { unitPrice, quantity } = values;
    const product: IProduct = JSON.parse(values.product);

    const amount = unitPrice * quantity;
    const profit: number = (unitPrice - product.buyPrice) * quantity;

    if (product.stock < quantity || product.reorderLevel < quantity) {
      toast.error(`${product.title}: Re-order level`, {
        autoClose: 5000,
      });
      resetAddItemForm(resetForm, values);
    } else {
      const productInOrder = orders.find((order) => order.id === product.id);
      if (productInOrder) {
        const indexOfProductInOrder = orders.indexOf(productInOrder);
        const updatedItem = productInOrder;
        const newUnitPrice = unitPrice;
        const newQuantity = updatedItem.quantity + quantity;
        updatedItem.unitPrice = newUnitPrice;
        updatedItem.quantity = newQuantity;
        updatedItem.amount = newUnitPrice * newQuantity;
        const newOrders = [...orders];
        newOrders[indexOfProductInOrder] = updatedItem;
        setOrders(newOrders);
        resetAddItemForm(resetForm, values);
      } else {
        addToOrders({
          ...product,
          quantity,
          amount,
          unitPrice,
          orderId: new Date().getUTCMilliseconds(),
          profit,
        });

        resetAddItemForm(resetForm, values);
      }
    }
  };

  const createInvoice = ({
    values,
    resetForm,
  }: {
    values;
    resetForm: () => void;
  }) => {
    dispatch(
      createInvoiceFn(
        orders,
        {
          customerId: Number(values.customerId),
          saleType: values.saleType,
          amount: sumOfOrders(),
          profit: sumOfProfits(),
        },
        () => {
          resetForm();
          setOrders([]);
          setPrintInvoice(true);
        }
      )
    );
  };

  console.log(orders);

  return (
    <DashboardLayout screenTitle="Create Invoice">
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
                initialValues={{
                  customerId: '',
                  saleType: '',
                  product: '',
                  unitPrice: '',
                  quantity: '',
                }}
                onSubmit={addItemToOrder}
              >
                {({
                  handleSubmit,
                  handleChange,
                  values,
                  resetForm,
                  // setFieldValue,
                }) => (
                  <Form>
                    <div className="field">
                      <label htmlFor="customer">Customer</label>
                      <Field
                        id="customer"
                        name="customerId"
                        component="select"
                        className="ui dropdown"
                        onChange={(e) => {
                          handleChange(e);
                          dispatch(getSingleCustomerFn(e.target.value));
                        }}
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
                      <div className="field">
                        <label htmlFor="product">Product</label>
                        <Field
                          id="product"
                          name="product"
                          component="select"
                          className="ui dropdown"
                          onChange={(e: React.ChangeEvent<any>) => {
                            handleChange(e);
                            // setFieldValue('unitPrice', '');
                          }}
                        >
                          <option value="" disabled hidden>
                            Select Product
                          </option>
                          {products.map((product) => (
                            <option
                              key={product.id}
                              value={JSON.stringify(product)}
                            >
                              {product.title}
                            </option>
                          ))}
                        </Field>
                      </div>
                      {values.product
                        ? renderPrices(JSON.parse(values.product))
                        : null}
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
                      disabled={orders.length < 1}
                      onClick={() => createInvoice({ values, resetForm })}
                      type="button"
                      fluid
                      positive
                    >
                      Save
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

export default InvoiceScreen;
