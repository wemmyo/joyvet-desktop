import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
// import * as Yup from 'yup';
import {
  getCustomersFn,
  selectCustomerState,
} from '../../../../slices/customerSlice';
import {
  createReceiptFn,
  getReceiptsFn,
} from '../../../../slices/receiptSlice';
import TextInput from '../../../../components/TextInput/TextInput';

const CreateReceipt: React.FC = () => {
  const dispatch = useDispatch();

  const customerState = useSelector(selectCustomerState);

  const { data: customersRaw } = customerState.customers;

  const customers = customersRaw ? JSON.parse(customersRaw) : [];

  const fetchCustomers = () => {
    dispatch(getCustomersFn());
  };
  const fetchReceipts = () => {
    dispatch(getReceiptsFn());
  };

  useEffect(fetchCustomers, []);

  const handleNewReceipt = (values: any) => {
    dispatch(
      createReceiptFn(values, () => {
        fetchReceipts();
      })
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

  return (
    <Formik
      initialValues={{
        customerId: '',
        amount: '',
        note: '',
      }}
      // validationSchema={CreateReceiptSchema}
      onSubmit={(values, actions) => {
        handleNewReceipt(values);
        actions.resetForm();
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <div className="field">
            <label htmlFor="customerId">Customer</label>
            <Field
              id="customerId"
              name="customerId"
              component="select"
              className="ui dropdown"
            >
              <option value="" disabled hidden>
                Select Customer
              </option>
              {renderCustomers()}
            </Field>
          </div>

          <Field
            name="amount"
            placeholder="Amount Paid"
            label="Amount Paid"
            type="text"
            component={TextInput}
          />
          <Field
            name="note"
            placeholder="Note"
            label="Note"
            type="text"
            component={TextInput}
          />
          <Button onClick={() => handleSubmit()} type="Submit" fluid primary>
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default CreateReceipt;
