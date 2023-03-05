/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Table,
  Grid,
  Button,
  Form,
  Segment,
  // Select,
} from 'semantic-ui-react';

import DashboardLayout from '../../../layouts/DashboardLayout/DashboardLayout';
// import { numberWithCommas } from '../../../utils/helpers';
import {
  getCustomersFn,
  selectCustomerState,
} from '../../../slices/customerSlice';
import {
  getProductsFn,
  selectProductState,
} from '../../../slices/productSlice';
import {
  getSingleInvoiceFn,
  selectInvoiceState,
  deleteInvoiceItemFn,
  addInvoiceItemFn,
} from '../../../slices/invoiceSlice';

interface FormValues {
  customerId: string;
  saleType: string;
  product: string;
  unitPrice: string;
  quantity: string;
}

export default function EditInvoiceScreen() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => console.log(data);

  const { id: invoiceId } = useParams() as { id: string };

  const dispatch = useDispatch();

  //   const eligibilityFactors = useSelector(
  //     (state: RootState) => state.eligibilityFactors
  // )

  const { customers } = useSelector(selectCustomerState);
  const { products } = useSelector(selectProductState);
  const { singleInvoice } = useSelector(selectInvoiceState);

  useEffect(() => {
    dispatch(getCustomersFn());
    dispatch(getProductsFn('inStock'));
    getSingleInvoiceFn(Number(invoiceId));
  }, [dispatch, invoiceId]);

  const renderCustomers = (() => {
    const customerList = customers.data.map((customer) => {
      return (
        <option key={customer.id} value={customer.id}>
          {customer.fullName}
        </option>
      );
    });
    return customerList;
  })();

  return (
    <DashboardLayout screenTitle={`Edit Invoice `}>
      <Grid>
        <Grid.Row>
          <Grid.Column width={11}>
            <h1>Total: ₦0</h1>
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

              {/* <Table.Body>{renderOrders()}</Table.Body> */}

              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                  <Table.HeaderCell />
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>
                    {/* ₦{numberWithCommas(singleInvoice.amount)} */}
                  </Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.Row>
              </Table.Footer>
            </Table>
          </Grid.Column>
          <Grid.Column width={5}>
            <Segment>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="field">
                  <label htmlFor="customer">Customer</label>
                  <select
                    id="customer"
                    {...register('customerId')}
                    className="ui dropdown"
                    // disabled
                  >
                    <option value="" disabled hidden>
                      Select Customer
                    </option>
                    {renderCustomers}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="saleType">Sale Type</label>
                  <select
                    id="saleType"
                    {...register('saleType')}
                    className="ui dropdown"
                    // disabled
                  >
                    <option value="" disabled hidden>
                      Select Sale
                    </option>
                    <option value="cash">Cash Sales</option>
                    <option value="credit">Credit Sales</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <Segment raised>
                  <div className="field">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                      id="quantity"
                      type="number"
                      {...register('quantity')}
                    />
                  </div>

                  <Button type="Submit" fluid primary>
                    Add Item
                  </Button>
                </Segment>
                <Button type="button" fluid positive>
                  Print
                </Button>
              </Form>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </DashboardLayout>
  );
}
