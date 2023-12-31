import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import { IStoreInfo } from '../../../../models/storeInfo';

export interface CreateStoreInfoProps {
  createStoreInfoFn: (values: Partial<IStoreInfo>) => void;
}

const CreateStoreInfoSchema = Yup.object().shape({
  storeName: Yup.string().required('Required'),
  address: Yup.string().required('Required'),
  phoneNumber: Yup.string().required('Required'),
});

const CreateStoreInfo: React.FC<CreateStoreInfoProps> = ({
  createStoreInfoFn,
}: CreateStoreInfoProps) => {
  return (
    <Formik
      initialValues={{
        storeName: '',
        address: '',
        phoneNumber: '',
      }}
      validationSchema={CreateStoreInfoSchema}
      onSubmit={(values, actions) => {
        createStoreInfoFn(values);
        actions.resetForm();
      }}
    >
      {({ handleSubmit }) => (
        <Form>
          <Field
            name="storeName"
            placeholder="Store name"
            label="Store name"
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
            placeholder="Phone number"
            label="Phone number"
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
export default CreateStoreInfo;
