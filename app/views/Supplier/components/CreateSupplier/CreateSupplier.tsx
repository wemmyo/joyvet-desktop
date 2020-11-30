import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';

const CreateSupplierSchema = Yup.object().shape({
  fullName: Yup.string().required('Required'),
});

export interface CreateSupplierProps {
  createSupplierFn: (values: any) => void;
}

const CreateSupplier: React.FC<CreateSupplierProps> = ({
  createSupplierFn,
}: CreateSupplierProps) => {
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
