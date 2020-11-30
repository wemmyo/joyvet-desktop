import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleReceiptFn,
  selectReceiptState,
  updateReceiptFn,
  getReceiptsFn,
} from '../../../../slices/receiptSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import {
  getCustomersFn,
  selectCustomerState,
} from '../../../../slices/customerSlice';

export interface EditReceiptProps {
  receiptId: string | number;
}

const EditReceipt: React.FC<EditReceiptProps> = ({
  receiptId,
}: EditReceiptProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleReceiptFn(receiptId));
    dispatch(getCustomersFn());
  };

  useEffect(fetchData, [receiptId]);

  const receiptState = useSelector(selectReceiptState);
  const customerState = useSelector(selectCustomerState);

  const { data: receiptRaw } = receiptState.singleReceipt;
  const { data: customersRaw } = customerState.customers;

  const receipt = receiptRaw ? JSON.parse(receiptRaw) : {};
  const customers = customersRaw ? JSON.parse(customersRaw) : [];

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

// const EditReceiptSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
