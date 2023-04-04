import React, { useEffect, useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import { Field, Formik } from 'formik';

import TextInput from '../../../../components/TextInput/TextInput';
import { numberWithCommas } from '../../../../utils/helpers';
import {
  getCustomersFn,
  getSingleCustomerFn,
} from '../../../../controllers/customer.controller';
import {
  getReceiptsFn,
  createReceiptFn,
} from '../../../../controllers/receipt.controller';
import { ICustomer } from '../../../../models/customer';

const CreateReceipt: React.FC = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [singleCustomer, setSingleCustomer] = useState<ICustomer>(
    {} as ICustomer
  );

  const fetchCustomers = async () => {
    const reponse = await getCustomersFn();
    setCustomers(reponse);
  };

  const fetchReceipts = async () => {
    await getReceiptsFn();
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleNewReceipt = (values) => {
    createReceiptFn(values, () => {
      fetchReceipts();
    });
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

  const showCustomerBalance = () => {
    if (singleCustomer.balance) {
      return (
        <Message>
          {`Balance:
          ${numberWithCommas(singleCustomer.balance)}`}
        </Message>
      );
    }
    return null;
  };

  const renderBanks = (paymentMethod: string) => {
    if (paymentMethod === 'transfer') {
      return (
        <div className="field">
          <label htmlFor="bank">Bank</label>
          <Field
            id="bank"
            name="bank"
            component="select"
            className="ui dropdown"
          >
            <option value="" disabled hidden>
              Select Bank
            </option>
            <option>GTB</option>
            <option>FCMB</option>
            <option>First Bank</option>
          </Field>
        </div>
      );
    }
    return null;
  };

  return (
    <Formik
      initialValues={{
        customerId: '',
        amount: '',
        paymentMethod: '',
        bank: '',
        note: '',
      }}
      // validationSchema={CreateReceiptSchema}
      onSubmit={(values, actions) => {
        handleNewReceipt(values);
        actions.resetForm();
        setSingleCustomer({} as ICustomer);
      }}
    >
      {({ handleSubmit, handleChange, values }) => (
        <Form>
          <div className="field">
            <label htmlFor="customerId">Customer</label>
            <Field
              id="customerId"
              name="customerId"
              component="select"
              className="ui dropdown"
              onChange={async (e: { currentTarget: { value: any } }) => {
                // call the built-in handleBur
                handleChange(e);
                // and do something about e
                const customerId = e.currentTarget.value;
                // console.log(someValue);
                await getSingleCustomerFn(customerId);

                // ...
              }}
            >
              <option value="" disabled hidden>
                Select Customer
              </option>
              {renderCustomers()}
            </Field>
          </div>

          {showCustomerBalance()}

          <Field
            name="amount"
            placeholder="Amount"
            label="Amount"
            type="text"
            component={TextInput}
          />

          <div className="field">
            <label htmlFor="paymentMethod">Payment Method</label>
            <Field
              id="paymentMethod"
              name="paymentMethod"
              component="select"
              className="ui dropdown"
            >
              <option value="" disabled hidden>
                Select option
              </option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </Field>
          </div>
          {renderBanks(values.paymentMethod)}
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
