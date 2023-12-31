import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import TextInput from '../../../../components/TextInput/TextInput';
import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import routes from '../../../../routing/routes';
import { isAdmin } from '../../../../utils/helpers';
import {
  getSingleSupplierFn,
  deleteSupplierFn,
  getSuppliersFn,
  updateSupplierFn,
} from '../../../../controllers/supplier.controller';
import { ISupplier } from '../../../../models/supplier';

export interface EditSupplierProps {
  supplierId: number;
}

const EditSupplier: React.FC<EditSupplierProps> = ({
  supplierId,
}: EditSupplierProps) => {
  const [supplier, setSupplier] = useState<ISupplier>({} as ISupplier);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleSupplierFn(supplierId);
      setSupplier(response);
    };
    fetchData();
  }, [supplierId]);

  const { fullName, address, phoneNumber, balance } = supplier;

  const handleDeleteSupplier = async () => {
    await deleteSupplierFn(supplierId);
    dispatch(closeSideContentFn());
    await getSuppliersFn();
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
      onSubmit={async (values) => {
        await updateSupplierFn(values, supplierId);
        dispatch(closeSideContentFn());
        await getSuppliersFn();
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
