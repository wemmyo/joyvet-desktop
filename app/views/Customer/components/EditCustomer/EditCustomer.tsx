import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleCustomerFn,
  selectCustomerState,
  updateCustomerFn,
  getCustomersFn,
} from '../../../../slices/customerSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';

export interface EditCustomerProps {
  customerId: string | number;
}

const EditCustomer: React.FC<EditCustomerProps> = ({
  customerId,
}: EditCustomerProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleCustomerFn(customerId));
  };

  useEffect(fetchData, [customerId]);

  const customerState = useSelector(selectCustomerState);

  const { data: customerRaw } = customerState.singleCustomer;

  const customer = customerRaw ? JSON.parse(customerRaw) : {};
  // console.log(customer);

  const { fullName, address, phoneNumber, balance } = customer;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        fullName: fullName || '',
        address: address || '',
        phoneNumber: phoneNumber || '',
        balance: balance || '',
      }}
      // validationSchema={EditCustomerSchema}
      onSubmit={(values) => {
        //   submitForm(values);
        // console.log(values);

        dispatch(
          updateCustomerFn(values, customerId, () => {
            dispatch(closeSideContentFn());
            dispatch(getCustomersFn());
          })
        );
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="fullName"
            placeholder="Full Name"
            label="Full Name"
            type="text"
            component={TextInput}
          />
          <Field
            name="address"
            placeholder="Address"
            label="Address"
            type="text"
            component={TextInput}
          />
          <Field
            name="phoneNumber"
            placeholder="Phone Number"
            label="Phone Number"
            type="tel"
            component={TextInput}
          />
          <Field
            name="balance"
            placeholder="Balance"
            label="Balance"
            type="number"
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
export default EditCustomer;

// const EditCustomerSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
