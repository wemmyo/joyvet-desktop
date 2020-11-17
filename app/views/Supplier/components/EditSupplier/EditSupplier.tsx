import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleSupplierFn,
  selectSupplierState,
  updateSupplierFn,
  getSuppliersFn,
} from '../../../../slices/supplierSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';

export interface EditSupplierProps {
  supplierId: string | number;
}

const EditSupplier: React.FC<EditSupplierProps> = ({ supplierId }) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleSupplierFn(supplierId));
  };

  useEffect(fetchData, [supplierId]);

  const supplierState = useSelector(selectSupplierState);

  const { data: supplierRaw } = supplierState.singleSupplier;

  const supplier = supplierRaw ? JSON.parse(supplierRaw) : {};
  // console.log(supplier);

  const { fullName, address, phoneNumber, balance } = supplier;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        fullName: fullName || '',
        address: address || '',
        phoneNumber: phoneNumber || '',
        balance: balance || '',
      }}
      // validationSchema={EditSupplierSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        // console.log(values);

        dispatch(
          updateSupplierFn(values, supplierId, () => {
            dispatch(closeSideContentFn());
            dispatch(getSuppliersFn());
          })
        );
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
            Update
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditSupplier;

// const EditSupplierSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
