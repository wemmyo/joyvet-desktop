import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleCustomerFn,
  selectCustomerState,
  updateCustomerFn,
  getCustomersFn,
  deleteCustomerFn,
} from '../../../../slices/customerSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';

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

  const { fullName, address, phoneNumber, balance, maxPriceLevel } = customer;

  const handleDeleteCustomer = () => {
    dispatch(
      deleteCustomerFn(customerId, () => {
        dispatch(closeSideContentFn());
        dispatch(getCustomersFn());
      })
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        fullName: fullName || '',
        address: address || '',
        phoneNumber: phoneNumber || '',
        balance: balance || '',
        maxPriceLevel: maxPriceLevel || '',
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
        <>
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
              disabled={!isAdmin()}
            />
            <Field
              name="maxPriceLevel"
              placeholder="Max Price Level"
              label="Max Price Level"
              type="number"
              component={TextInput}
              disabled={!isAdmin()}
            />
          </Form>
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={() => handleSubmit()} type="Submit" positive>
              Update
            </Button>
            {isAdmin() ? (
              <Button onClick={handleDeleteCustomer} type="button" negative>
                Delete
              </Button>
            ) : null}
            <Button as={Link} to={`${routes.CUSTOMER}/${customerId}`}>
              History
            </Button>
          </div>
        </>
      )}
    </Formik>
  );
};
export default EditCustomer;

// const EditCustomerSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
