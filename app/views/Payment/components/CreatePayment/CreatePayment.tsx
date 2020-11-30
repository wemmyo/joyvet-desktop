import React, { useEffect } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
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
import TextInput from '../../../../components/TextInput/TextInput';

const CreatePayment: React.FC = () => {
  const dispatch = useDispatch();

  const supplierState = useSelector(selectSupplierState);

  const { data: suppliersRaw } = supplierState.suppliers;
  const { data: singleSupplierRaw } = supplierState.singleSupplier;

  const suppliers = suppliersRaw ? JSON.parse(suppliersRaw) : [];
  const singleSupplier = singleSupplierRaw ? JSON.parse(singleSupplierRaw) : {};

  const fetchSuppliers = () => {
    dispatch(getSuppliersFn());
  };
  const fetchPayments = () => {
    dispatch(getPaymentsFn());
  };

  useEffect(fetchSuppliers, []);

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
    if (singleSupplier.balance) {
      return (
        <Message>
          Outstanding balance:
          {singleSupplier.balance}
        </Message>
      );
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
        dispatch(
          createPaymentFn(values, () => {
            fetchPayments();
            actions.resetForm();
            dispatch(clearSingleSupplierFn());
          })
        );
      }}
    >
      {({ handleSubmit, handleChange }) => (
        <Form>
          <div className="field">
            <label htmlFor="supplierId">Supplier</label>
            <Field
              id="supplierId"
              name="supplierId"
              component="select"
              className="ui dropdown"
              onChange={(e: { currentTarget: { value: any } }) => {
                // call the built-in handleBur
                handleChange(e);
                // and do something about e
                const supplierId = e.currentTarget.value;
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
