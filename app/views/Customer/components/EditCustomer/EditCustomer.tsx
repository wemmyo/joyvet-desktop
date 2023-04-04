import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';

import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';
import { ICustomer } from '../../../../models/customer';
import {
  getSingleCustomerFn,
  deleteCustomerFn,
  getCustomersFn,
  updateCustomerFn,
} from '../../../../controllers/customer.controller';

export interface EditCustomerProps {
  customerId: number;
}

const EditCustomer: React.FC<EditCustomerProps> = ({
  customerId,
}: EditCustomerProps) => {
  const [customer, setCustomer] = useState<ICustomer>({} as ICustomer);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleCustomerFn(Number(customerId));
      setCustomer(response);
    };

    fetchData();
  }, [customerId]);

  const { fullName, address, phoneNumber, balance, maxPriceLevel } = customer;

  const handleDeleteCustomer = async () => {
    await deleteCustomerFn(Number(customerId));
    dispatch(closeSideContentFn());
    await getCustomersFn();
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
      onSubmit={async (values) => {
        //   submitForm(values);
        // console.log(values);

        await updateCustomerFn(values, customerId);
        dispatch(closeSideContentFn());
        await getCustomersFn();
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
