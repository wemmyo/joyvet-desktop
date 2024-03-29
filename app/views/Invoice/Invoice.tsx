import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Table, Grid, Button, Form, Segment } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { toast } from 'react-toastify';

import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

import { numberWithCommas } from '../../utils/helpers';
import TextInput from '../../components/TextInput/TextInput';
import ComponentToPrint from '../../components/PrintedReceipt/ReceiptWrapper';
import { IProduct } from '../../models/product';
import { IInvoiceItem } from '../../models/invoiceItem';
import { IInvoice } from '../../models/invoice';
import {
  getCustomersFn,
  getSingleCustomerFn,
} from '../../controllers/customer.controller';
import {
  createInvoiceFn,
  getSingleInvoiceFn,
} from '../../controllers/invoice.controller';
import { getProductsFn } from '../../controllers/product.controller';
import { ICustomer } from '../../models/customer';

interface InvoiceItem extends IInvoiceItem {
  product: IProduct;
}

const InvoiceScreen: React.FC = () => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoice, setInvoice] = useState<Partial<IInvoice>>();
  const [printInvoice, setPrintInvoice] = useState(false);
  const [singleCustomer, setSingleCustomer] = useState({} as ICustomer);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [createdInvoice, setCreatedInvoice] = useState<IInvoice>(
    {} as IInvoice
  );

  const removeInvoiceItem = (id: number) => {
    const filteredItems = invoiceItems.filter((item) => item.id !== id);
    setInvoiceItems(filteredItems);
  };

  const updateInvoiceItem = (updatedItem: InvoiceItem) => {
    // check reorder level
    if (
      updatedItem.product?.stock < updatedItem.quantity ||
      updatedItem.product?.reorderLevel < updatedItem.quantity
    ) {
      toast.error(`${updatedItem.product?.title}: Re-order level`, {
        autoClose: 5000,
      });
    }

    setInvoiceItems((currentItems) => {
      const itemIndex = currentItems.findIndex(
        (item) => item.product?.id === updatedItem.product.id
      );

      if (itemIndex !== -1) {
        const updatedItems = [...currentItems];
        const existingItem = updatedItems[itemIndex];
        const updatedQuantity = existingItem.quantity + updatedItem.quantity;
        const updatedAmount = updatedItem.unitPrice * updatedQuantity;
        const updatedProfit =
          (updatedItem.unitPrice - updatedItem.product.buyPrice) *
          updatedQuantity;

        updatedItems[itemIndex] = {
          ...existingItem,
          quantity: updatedQuantity,
          amount: updatedAmount,
          profit: updatedProfit,
        };

        return updatedItems;
      }

      return [...currentItems, updatedItem];
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const getCustomers = getCustomersFn();
      const getproducts = getProductsFn('inStock');
      const [customersResponse, productsResponse] = await Promise.all([
        getCustomers,
        getproducts,
      ]);
      setCustomers(customersResponse);
      setProducts(productsResponse);
    };
    fetchData();
  }, []);

  const renderPrices = (product: IProduct) => {
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

    return (
      <div className="field">
        <label htmlFor="unitPrice">Unit Price</label>
        <Field
          id="unitPrice"
          name="unitPrice"
          component="select"
          className="ui dropdown"
        >
          <option value="" disabled hidden>
            Select Price
          </option>
          {filteredPriceLevel.map((price) => (
            <option key={price.label} value={price.value}>
              {`${price.label}: ₦${numberWithCommas(price.value)}`}
            </option>
          ))}
        </Field>
      </div>
    );
  };

  const renderCustomers = () => {
    const customerList = customers.map((customer: ICustomer) => {
      return (
        <option key={customer.id} value={customer.id}>
          {customer.fullName}
        </option>
      );
    });
    return customerList;
  };

  useEffect(() => {
    // This effect only needs to track invoiceItems changes for recalculating totals
    const totalAmount = invoiceItems.reduce(
      (acc, item) => acc + item.amount,
      0
    );
    const totalProfit = invoiceItems.reduce(
      (acc, item) => acc + item.profit,
      0
    );
    // Directly updating invoice state with recalculated totals
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      amount: totalAmount,
      profit: totalProfit,
    }));
  }, [invoiceItems]); // Removed JSON.stringify to focus on the specific state dependency

  const renderOrders = invoiceItems.map((invoiceItem, index) => {
    return (
      <Table.Row key={invoiceItem.id}>
        <Table.Cell>{index + 1}</Table.Cell>
        <Table.Cell>{invoiceItem.product?.title}</Table.Cell>
        <Table.Cell>{invoiceItem.quantity}</Table.Cell>
        <Table.Cell>{numberWithCommas(invoiceItem.unitPrice)}</Table.Cell>
        <Table.Cell>{numberWithCommas(invoiceItem.amount)}</Table.Cell>
        <Table.Cell>
          <Button
            onClick={() => {
              removeInvoiceItem(invoiceItem.id);
            }}
            negative
          >
            Remove
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  });

  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return (
        <div style={{ display: 'none' }}>
          <ComponentToPrint ref={componentRef} invoice={createdInvoice} />
        </div>
      );
    }
    return null;
  };

  const createInvoice = async (resetForm) => {
    await createInvoiceFn(invoiceItems, invoice, async (id) => {
      const response = await getSingleInvoiceFn(id);
      setCreatedInvoice(response);
      setPrintInvoice(true);
      handlePrint?.();
      resetForm();
      setInvoiceItems([]);
      setInvoice(undefined);
      setCreatedInvoice({} as IInvoice);
    });
  };

  const initialValues = {
    quantity: '',
    unitPrice: '',
    product: '',
    id: '',
    amount: '',
    profit: '',
  };

  return (
    <DashboardLayout screenTitle="Create Invoice">
      <Grid>
        <Grid.Row>
          <Grid.Column width={11}>
            <h1>
              Total: ₦{invoice?.amount ? numberWithCommas(invoice.amount) : 0}
            </h1>
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

              <Table.Body>{renderOrders}</Table.Body>

              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>
                    ₦{invoice?.amount ? numberWithCommas(invoice.amount) : 0}
                  </Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Footer>
            </Table>
          </Grid.Column>
          <Grid.Column width={5}>
            <Segment>
              <Formik
                initialValues={initialValues}
                onSubmit={(values, { resetForm }) => {
                  const product: IProduct = JSON.parse(values.product as any);
                  const quantity = Number(values.quantity);
                  const unitPrice = Number(values.unitPrice);
                  const amount = unitPrice * quantity;
                  const profit: number =
                    (unitPrice - product.buyPrice) * quantity;

                  updateInvoiceItem({
                    id: new Date().getUTCMilliseconds(),
                    quantity,
                    unitPrice,
                    amount,
                    profit,
                    product,
                  });
                  resetForm();
                }}
              >
                {({
                  handleSubmit,
                  handleChange,
                  values,
                  resetForm,
                  setFieldValue,
                }) => (
                  <Form>
                    <div className="field">
                      <label htmlFor="customer">Customer</label>
                      <Field
                        id="customer"
                        name="customerId"
                        component="select"
                        className="ui dropdown"
                        onChange={async (e) => {
                          const customerId = Number(e.target.value);
                          handleChange(e);
                          setInvoice({
                            ...invoice,
                            customerId,
                          });
                          const response = await getSingleCustomerFn(
                            customerId
                          );
                          setSingleCustomer(response);
                        }}
                      >
                        <option value="" selected disabled hidden>
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
                        onChange={(e) => {
                          setInvoice({
                            ...invoice,
                            saleType: e.target.value,
                          });
                        }}
                      >
                        <option value="" selected disabled hidden>
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
                            // clear unit price field when product is changed
                            setFieldValue('unitPrice', '');
                          }}
                        >
                          <option value="" selected disabled hidden>
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
                        ? renderPrices(
                            JSON.parse((values.product as unknown) as string)
                          )
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
                      disabled={invoiceItems.length < 1}
                      onClick={() => createInvoice(resetForm)}
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
