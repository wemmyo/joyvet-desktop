import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

export interface CreateSupplierProps {
  createSupplierFn: (values: any) => void;
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
const CreateSupplier: React.FC<CreateSupplierProps> = ({
  createSupplierFn,
}) => {
  return (
    <Formik
      initialValues={{
        fullName: '',
        address: '',
        phoneNumber: '',
        balance: '',
      }}
      validationSchema={CreateSupplierSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        createSupplierFn(values);
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
export default CreateSupplier;

const CreateSupplierSchema = Yup.object().shape({
  fullName: Yup.string().required('Required'),
});
