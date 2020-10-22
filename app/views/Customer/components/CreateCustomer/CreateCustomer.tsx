import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

export interface CreateCustomerProps {
  createCustomerFn: (values: any) => void;
}

// const options = [
//   { key: 'm', text: 'Male', value: 'male' },
//   { key: 'f', text: 'Female', value: 'female' },
//   { key: 'o', text: 'Other', value: 'other' },
// ];

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
const CreateCustomer: React.FC<CreateCustomerProps> = ({
  createCustomerFn,
}) => {
  return (
    <Formik
      initialValues={{
        fullName: '',
        // address: '',
        // phoneNumber: '',
        // balance: '',
      }}
      validationSchema={CreateCustomerSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        createCustomerFn(values);
        actions.resetForm();
        // console.log(values);
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
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default CreateCustomer;

const CreateCustomerSchema = Yup.object().shape({
  fullName: Yup.string().required('Required'),
});
