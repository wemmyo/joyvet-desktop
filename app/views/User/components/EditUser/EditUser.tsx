import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

// import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleUserFn,
  selectUserState,
  updateUserFn,
  getUsersFn,
} from '../../../../slices/userSlice';

import { closeSideContentFn } from '../../../../slices/dashboardSlice';

export interface EditUserProps {
  userId: string | number;
}

const EditUser: React.FC<EditUserProps> = ({ userId }) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleUserFn(userId));
  };

  useEffect(fetchData, [userId]);

  const userState = useSelector(selectUserState);

  const { data: userRaw } = userState.singleUser;

  const user = userRaw ? JSON.parse(userRaw) : {};
  // console.log(user);

  const { title, stock, unitPrice } = user;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        title: title || '',
        stock: stock || '',
        unitPrice: unitPrice || '',
      }}
      // validationSchema={EditUserSchema}
      onSubmit={(values, actions) => {
        //   submitForm(values);
        // console.log(values);

        dispatch(
          updateUserFn(values, userId, () => {
            dispatch(closeSideContentFn());
            dispatch(getUsersFn());
          })
        );
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
            Update
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default EditUser;

// const EditUserSchema = Yup.object().shape({
//   title: Yup.string().required('Required'),
// });
