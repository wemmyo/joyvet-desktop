import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useDispatch } from 'react-redux';

import TextInput from '../../../../components/TextInput/TextInput';

import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import { IStoreInfo } from '../../../../models/storeInfo';
import {
  deleteStoreInfoFn,
  getSingleStoreInfoFn,
  getStoreInfoFn,
  updateStoreInfoFn,
} from '../../../../controllers/storeInfo.controller';

export interface EditStoreInfoProps {
  storeInfoId: string | number;
}

const EditStoreInfo: React.FC<EditStoreInfoProps> = ({
  storeInfoId,
}: EditStoreInfoProps) => {
  const [storeInfo, setStoreInfo] = useState<IStoreInfo>({} as IStoreInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleStoreInfoFn(Number(storeInfoId));
      setStoreInfo(response);
    };
    fetchData();
  }, [storeInfoId]);

  const deleteStoreInfo = async () => {
    await deleteStoreInfoFn(Number(storeInfoId));
    await getStoreInfoFn();
    dispatch(closeSideContentFn());
  };

  const { address, storeName, phoneNumber } = storeInfo;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        storeName: storeName || '',
        address: address || '',
        phoneNumber: phoneNumber || '',
      }}
      onSubmit={async (values) => {
        await updateStoreInfoFn(values, Number(storeInfoId));
        dispatch(closeSideContentFn());
        await getStoreInfoFn();
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
            placeholder="Adress"
            label="Adress"
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
            Update
          </Button>
          <Button
            style={{ marginTop: '1rem' }}
            onClick={deleteStoreInfo}
            type="Submit"
            fluid
            negative
          >
            Delete
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditStoreInfo;
