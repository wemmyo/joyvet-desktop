import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
// import * as Yup from 'yup';
import {
  getSuppliersFn,
  selectSupplierState,
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
    const supplierList = suppliers.map((supplier: any) => {
      return (
        <option key={supplier.id} value={supplier.id}>
          {supplier.fullName}
        </option>
      );
    });
    return supplierList;
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
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <div className="field">
            <label>Supplier</label>
            <Field name="supplierId" component="select" className="ui dropdown">
              <option value="" disabled hidden>
                Select Supplier
              </option>
              {renderSuppliers()}
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
