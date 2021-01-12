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
import { numberWithCommas } from '../../../../utils/helpers';

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
          {`Balance:
          ${numberWithCommas(singleSupplier.balance)}`}
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
        supplierId: '',
        amount: '',
        paymentMethod: '',
        bank: '',
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
      {({ handleSubmit, handleChange, values }) => (
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
export default CreatePayment;
