import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import { ICustomer } from '../../../../models/customer';

const CreateCustomerSchema = Yup.object().shape({
  fullName: Yup.string().required('Required'),
});

export interface CreateCustomerProps {
  createCustomerFn: (values: Partial<ICustomer>) => void;
}

const CreateCustomer: React.FC<CreateCustomerProps> = ({
  createCustomerFn,
}: CreateCustomerProps) => {
  return (
    <Formik
      initialValues={{
        fullName: '',
        address: '',
        phoneNumber: '',
        balance: 0,
      }}
      validationSchema={CreateCustomerSchema}
      onSubmit={(values, actions) => {
        createCustomerFn(values);
        actions.resetForm();
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
            type="text"
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
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default CreateCustomer;
