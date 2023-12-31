import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useDispatch } from 'react-redux';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  updateReceiptFn,
  getReceiptsFn,
  getSingleReceiptFn,
} from '../../../../controllers/receipt.controller';
import { ICustomer } from '../../../../models/customer';
import { IReceipt } from '../../../../models/receipt';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import { getCustomersFn } from '../../../../controllers/customer.controller';

export interface EditReceiptProps {
  receiptId: string | number;
}

const EditReceipt: React.FC<EditReceiptProps> = ({
  receiptId,
}: EditReceiptProps) => {
  const [receipt, setReceipt] = useState<IReceipt>({} as IReceipt);
  const [customers, setCustomers] = useState<ICustomer[]>([] as ICustomer[]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const getSingleReceipt = getSingleReceiptFn(receiptId);
      const getCustomers = getCustomersFn();
      const [receiptResponse, customersResponse] = await Promise.all([
        getSingleReceipt,
        getCustomers,
      ]);
      setReceipt(receiptResponse);
      setCustomers(customersResponse);
    };
    fetchData();
  }, [receiptId]);

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

  const { customerId, amount, note } = receipt;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        customerId: customerId || '',
        amount: amount || '',
        note: note || '',
      }}
      // validationSchema={EditReceiptSchema}
      onSubmit={(values) => {
        //   submitForm(values);
        // console.log(values);

        dispatch(
          updateReceiptFn(values, receiptId, () => {
            dispatch(closeSideContentFn());
            dispatch(getReceiptsFn());
          })
        );
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
            Update
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditReceipt;
