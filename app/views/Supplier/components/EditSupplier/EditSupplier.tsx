import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleSupplierFn,
  selectSupplierState,
  updateSupplierFn,
  getSuppliersFn,
  deleteSupplierFn,
} from '../../../../slices/supplierSlice';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';

export interface EditSupplierProps {
  supplierId: string | number;
}

const EditSupplier: React.FC<EditSupplierProps> = ({
  supplierId,
}: EditSupplierProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = () => {
      dispatch(getSingleSupplierFn(supplierId));
    };
    fetchData();
  }, [supplierId]);

  const supplierState = useSelector(selectSupplierState);

  const { data: supplierRaw } = supplierState.singleSupplier;

  const supplier = supplierRaw ? JSON.parse(supplierRaw) : {};
  // console.log(supplier);

  const { fullName, address, phoneNumber, balance } = supplier;

  const handleDeleteSupplier = () => {
    dispatch(
      deleteSupplierFn(supplierId, () => {
        dispatch(closeSideContentFn());
        dispatch(getSuppliersFn());
      })
    );
  };

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
      onSubmit={(values) => {
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
            disabled={!isAdmin()}
          />
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={() => handleSubmit()} type="Submit" positive>
              Update
            </Button>
            {isAdmin() ? (
              <Button onClick={handleDeleteSupplier} type="button" negative>
                Delete
              </Button>
            ) : null}
            <Button as={Link} to={`${routes.SUPPLIER}/${supplierId}`}>
              History
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default EditSupplier;

// const EditSupplierSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
