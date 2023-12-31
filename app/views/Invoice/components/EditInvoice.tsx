import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Table, Grid, Button, Form, Segment } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import moment from 'moment';

import DashboardLayout from '../../../layouts/DashboardLayout/DashboardLayout';
import { numberWithCommas } from '../../../utils/helpers';
import TextInput from '../../../components/TextInput/TextInput';
import ComponentToPrint from '../../../components/PrintedReceipt/ReceiptWrapper';
import { IProduct } from '../../../models/product';
import { IInvoiceItem } from '../../../models/invoiceItem';
import { IInvoice } from '../../../models/invoice';
import {
  addInvoiceItemFn,
  deleteInvoiceItemFn,
  getSingleInvoiceFn,
} from '../../../controllers/invoice.controller';
import { getProductsFn } from '../../../controllers/product.controller';
import { ICustomer } from '../../../models/customer';

interface InvoiceItem extends IInvoiceItem {
  product: IProduct;
}

const InvoiceScreen: React.FC = ({ match }: any) => {
  const invoiceId = match.params.id;

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoice, setInvoice] = useState<IInvoice>({} as IInvoice);
  const [printInvoice, setPrintInvoice] = useState(false);
  const [singleCustomer, setSingleCustomer] = useState({} as ICustomer);
  const [products, setProducts] = useState<IProduct[]>([]);

  const fetchData = useCallback(async () => {
    const getproducts = getProductsFn('inStock');
    const getSingleInvoice = getSingleInvoiceFn(Number(invoiceId));
    const [productsResponse, singleInvoiceResponse] = await Promise.all([
      getproducts,
      getSingleInvoice,
    ]);
    setProducts(productsResponse);

    setInvoice({
      ...singleInvoiceResponse,
      customerId: singleInvoiceResponse.customer.id,
      saleType: singleInvoiceResponse.saleType,
      id: singleInvoiceResponse.id,
      createdAt: singleInvoiceResponse.createdAt,
    });

    const invoiceItemList: InvoiceItem[] = [];

    // set invoice items
    singleInvoiceResponse.products.forEach((product) => {
      const { invoiceItem } = product;
      const item: InvoiceItem = {
        id: invoiceItem.id,
        quantity: invoiceItem.quantity,
        unitPrice: invoiceItem.unitPrice,
        amount: invoiceItem.amount,
        profit: invoiceItem.profit,
        product,
      };
      invoiceItemList.push(item);
    });

    setInvoiceItems(invoiceItemList);
    setSingleCustomer(singleInvoiceResponse.customer);
  }, [invoiceId]);

  useEffect(() => {
    fetchData();
  }, [invoiceId, fetchData]);

  const removeInvoiceItem = async (
    invoiceItemId: number,
    productId: number
  ) => {
    await deleteInvoiceItemFn({
      productId,
      invoiceId: Number(invoiceId),
      invoiceItemId,
    });
    fetchData();
  };

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
              removeInvoiceItem(invoiceItem.id, invoiceItem.product.id);
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
          <ComponentToPrint ref={componentRef} invoice={invoice} />
        </div>
      );
    }
    return null;
  };

  const handlePrintInvoice = () => {
    setPrintInvoice(true);
  };

  useEffect(() => {
    if (printInvoice) {
      handlePrint?.();
      setPrintInvoice(false); // set back to false after printing
    }
  }, [printInvoice, handlePrint]);

  const disabledAdditem = () => {
    const invoiceDate = moment(invoice?.createdAt).format('DD/MM/YYYY');
    const todaysDate = moment().format('DD/MM/YYYY');

    if (invoiceDate === todaysDate) {
      return false;
    }
    return true;
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
    <DashboardLayout screenTitle="Update Invoice">
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
            <p>
              Note: Use same price level when updating exisiting product
              quantity
            </p>
          </Grid.Column>
          <Grid.Column width={5}>
            <Segment>
              <Formik
                initialValues={initialValues}
                onSubmit={async (values, { resetForm }) => {
                  const product: IProduct = JSON.parse(values.product as any);
                  const quantity = Number(values.quantity);
                  const unitPrice = Number(values.unitPrice);
                  const amount = unitPrice * quantity;
                  const profit: number =
                    (unitPrice - product.buyPrice) * quantity;

                  const updatedItem = {
                    quantity,
                    unitPrice,
                    amount,
                    profit,
                    product,
                  };

                  await addInvoiceItemFn(invoice, updatedItem);
                  await fetchData();

                  resetForm();
                }}
              >
                {({ handleSubmit, handleChange, values, setFieldValue }) => (
                  <Form>
                    <div className="field">
                      <label htmlFor="customer">Customer</label>
                      <Field
                        disabled
                        id="customer"
                        name="customerId"
                        component="select"
                        className="ui dropdown"
                      >
                        <option selected disabled hidden>
                          {singleCustomer.fullName}
                        </option>
                      </Field>
                    </div>
                    <div className="field">
                      <label htmlFor="saleType">Sale Type</label>
                      <Field
                        disabled
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
                        <option selected disabled hidden>
                          {invoice?.saleType}
                        </option>
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
                        disabled={disabledAdditem()}
                      >
                        Add Item
                      </Button>
                    </Segment>
                    <Button
                      onClick={handlePrintInvoice}
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

export default InvoiceScreen;
