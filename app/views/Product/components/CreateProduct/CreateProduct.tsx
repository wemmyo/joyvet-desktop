import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';

export interface CreateProductProps {
  createProductFn: (values: {
    title: string;
    stock?: string;
    unitPrice?: string | number;
  }) => void;
}

const CreateProductSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
});

const CreateProduct: React.FC<CreateProductProps> = ({
  createProductFn,
}: CreateProductProps) => {
  return (
    <Formik
      initialValues={{
        title: '',
        stock: '',
        unitPrice: '',
      }}
      validationSchema={CreateProductSchema}
      onSubmit={(values, actions) => {
        createProductFn(values);
        actions.resetForm();
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="title"
            placeholder="Product Name"
            label="Product Name"
            type="text"
            component={TextInput}
          />
          <Field
            name="stock"
            placeholder="Quantity"
            label="Quantity"
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
