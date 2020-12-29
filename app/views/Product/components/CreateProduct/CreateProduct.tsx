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
        price1: '',
        price2: '',
        price3: '',
        price4: '',
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
            name="price1"
            placeholder="Price Level 1"
            label="Price Level 1"
            type="number"
            component={TextInput}
          />
          <Field
            name="price2"
            placeholder="Price Level 2"
            label="Price Level 2"
            type="number"
            component={TextInput}
          />
          <Field
            name="price3"
            placeholder="Price Level 3"
            label="Price Level 3"
            type="number"
            component={TextInput}
          />
          <Field
            name="price4"
            placeholder="Price Level 4"
            label="Price Level 4"
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
