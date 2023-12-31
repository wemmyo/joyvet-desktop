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
  refreshProducts: () => void;
}

const CreateProductSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
});

const CreateProduct: React.FC<CreateProductProps> = ({
  createProductFn,
  refreshProducts,
}: CreateProductProps) => {
  return (
    <Formik
      initialValues={{
        title: '',
        sellPrice: '',
        sellPrice2: '',
        sellPrice3: '',
        buyPrice: '',
      }}
      validationSchema={CreateProductSchema}
      onSubmit={(values, actions) => {
        createProductFn(values);
        refreshProducts();
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
            name="buyPrice"
            placeholder="Buy Price"
            label="Buy Price"
            type="number"
            component={TextInput}
          />
          <Field
            name="sellPrice"
            placeholder="Sell Price"
            label="Sell Price"
            type="number"
            component={TextInput}
          />
          <Field
            name="sellPrice2"
            placeholder="Sell Price 2"
            label="Sell Price 2"
            type="number"
            component={TextInput}
          />
          <Field
            name="sellPrice3"
            placeholder="Sell Price 3"
            label="Sell Price 3"
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
