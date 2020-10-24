import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

export interface CreateReceiptProps {
  createReceiptFn: (values: any) => void;
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
const CreateReceipt: React.FC<CreateReceiptProps> = ({ createReceiptFn }) => {
  return (
    <Formik
      initialValues={{
        customer: '',
        amountPaid: '',
      }}
      validationSchema={CreateReceiptSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        createReceiptFn(values);
        actions.resetForm();
        // console.log(values);
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="customer"
            placeholder="Customer"
            label="Customer"
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
export default CreateReceipt;

const CreateReceiptSchema = Yup.object().shape({
  customer: Yup.string().required('Required'),
  amountPaid: Yup.number()
    .required('Required')
    .positive('Amount cannot be negative'),
});
