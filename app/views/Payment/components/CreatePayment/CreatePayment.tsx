import React, { useEffect, useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import TextInput from '../../../../components/TextInput/TextInput';
import { numberWithCommas } from '../../../../utils/helpers';
import { createPaymentFn } from '../../../../controllers/payment.controller';
import {
  getSuppliersFn,
  getSingleSupplierFn,
} from '../../../../controllers/supplier.controller';
import { ISupplier } from '../../../../models/supplier';

interface ICreatePayment {
  refreshPayments: () => void;
}

const CreatePayment = ({ refreshPayments }: ICreatePayment) => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [singleSupplier, setSingleSupplier] = useState<ISupplier>(
    {} as ISupplier
  );

  useEffect(() => {
    const fetchSuppliers = async () => {
      const response = await getSuppliersFn();
      setSuppliers(response);
    };
    fetchSuppliers();
  }, []);

  const renderSuppliers = () => {
    const supplierList = suppliers.map((eachSupplier) => {
      return (
        <option key={eachSupplier.id} value={Number(eachSupplier.id)}>
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
            <option>UBA</option>
            <option>Zenith</option>
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
      onSubmit={async (values, actions) => {
        await createPaymentFn({
          ...values,
          supplierId: Number(values.supplierId),
          amount: Number(values.amount),
        });
        refreshPayments();
        actions.resetForm();
        setSingleSupplier({} as ISupplier);
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
              onChange={async (e: { currentTarget: { value: any } }) => {
                // call the built-in handleBur
                handleChange(e);
                // and do something about e
                const supplierId = e.currentTarget.value;
                // console.log(someValue);
                await getSingleSupplierFn(Number(supplierId));
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
            type="number"
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
