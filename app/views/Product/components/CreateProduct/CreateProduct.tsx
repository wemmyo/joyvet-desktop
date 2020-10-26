import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

export interface CreateProductProps {
  createProductFn: (values: any) => void;
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
const CreateProduct: React.FC<CreateProductProps> = ({ createProductFn }) => {
  return (
    <Formik
      initialValues={{
        title: '',
        stock: '',
        unitPrice: '',
      }}
      validationSchema={CreateProductSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        console.log(values);

        createProductFn(values);
        actions.resetForm();
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="title"
            placeholder="Title"
            label="Title"
            type="text"
            component={TextInput}
          />
          <Field
            name="stock"
            placeholder="Number In Stock"
            label="Number In Stock"
            type="number"
            component={TextInput}
          />
          <Field
            name="unitPrice"
            placeholder="Unit Price"
            label="Unit Price"
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
export default CreateProduct;

const CreateProductSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
});
