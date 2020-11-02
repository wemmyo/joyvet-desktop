import React, { useEffect } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
// import * as Yup from 'yup';
import {
  getSuppliersFn,
  getSingleSupplierFn,
  selectSupplierState,
  clearSingleSupplierFn,
} from '../../../../slices/supplierSlice';
import {
  createPaymentFn,
  getPaymentsFn,
} from '../../../../slices/paymentSlice';
import { useSelector, useDispatch } from 'react-redux';

export interface CreatePaymentProps {}

const CreatePayment: React.FC<CreatePaymentProps> = () => {
  const dispatch = useDispatch();
  const supplierState = useSelector(selectSupplierState);
  const { data: suppliers } = supplierState.suppliers;
  const { data: supplier } = supplierState.supplier;

  const fetchSuppliers = () => {
    dispatch(getSuppliersFn());
  };
  const fetchPayments = () => {
    dispatch(getPaymentsFn());
  };

  useEffect(fetchSuppliers, []);

  const handleNewPayment = (values: any) => {
    dispatch(
      createPaymentFn(values, () => {
        fetchPayments();
      })
    );
  };

  const renderSuppliers = () => {
    const supplierList = suppliers.map((eachSupplier: any) => {
      return (
        <option key={eachSupplier.id} value={eachSupplier.id}>
          {eachSupplier.fullName}
        </option>
      );
    });
    return supplierList;
  };

  const showSupplierBalance = () => {
    if (supplier.balance) {
      return <Message>Outstanding balance: {supplier.balance}</Message>;
    }
    return null;
  };

  return (
    <Formik
      initialValues={{
        supplierId: '',
        amount: '',
        note: '',
      }}
      // validationSchema={CreatePaymentSchema}
      onSubmit={(values, actions) => {
        handleNewPayment(values);
        actions.resetForm();
        dispatch(clearSingleSupplierFn());
      }}
    >
      {({ handleSubmit, handleChange }) => (
        <Form>
          <div className="field">
            <label>Supplier</label>
            <Field
              name="supplierId"
              component="select"
              className="ui dropdown"
              onChange={(e: { currentTarget: { value: any } }) => {
                // call the built-in handleBur
                handleChange(e);
                // and do something about e
                let supplierId = e.currentTarget.value;
                // console.log(someValue);
                dispatch(getSingleSupplierFn(supplierId));

                // ...
              }}
            >
              <option value="" disabled hidden>
                Select Supplier
              </option>
              {renderSuppliers()}
            </Field>
          </div>

          {showSupplierBalance()}

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
export default CreatePayment;

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
