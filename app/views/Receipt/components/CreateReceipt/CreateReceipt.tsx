import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
// import * as Yup from 'yup';
import {
  getCustomersFn,
  selectCustomerState,
} from '../../../../slices/customerSlice';
import {
  createReceiptFn,
  getReceiptsFn,
} from '../../../../slices/receiptSlice';
import { useSelector, useDispatch } from 'react-redux';

export interface CreateReceiptProps {}

const CreateReceipt: React.FC<CreateReceiptProps> = () => {
  const dispatch = useDispatch();
  const customerState = useSelector(selectCustomerState);
  const { data: customers } = customerState.customers;

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
          <Field name="customerId" component="select" className="ui dropdown">
            <option value="" disabled hidden>
              Select Customer
            </option>
            {renderCustomers()}
          </Field>

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
