import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

export interface CreatePaymentProps {
  createPaymentFn: (values: any) => void;
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
const CreatePayment: React.FC<CreatePaymentProps> = ({ createPaymentFn }) => {
  return (
    <Formik
      initialValues={{
        supplier: '',
        amountPaid: '',
      }}
      validationSchema={CreatePaymentSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        createPaymentFn(values);
        actions.resetForm();
        // console.log(values);
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="supplier"
            placeholder="Supplier"
            label="Supplier"
            type="text"
            component={TextInput}
          />
          <Field
            name="amountPaid"
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
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default CreatePayment;

const CreatePaymentSchema = Yup.object().shape({
  supplier: Yup.string().required('Required'),
  amountPaid: Yup.number()
    .required('Required')
    .positive('Amount cannot be negative'),
});
