import React, { useEffect } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';

import TextInput from '../../../../components/TextInput/TextInput';
import {
  getSingleUserFn,
  selectUserState,
  updateUserFn,
  getUsersFn,
  deleteUserFn,
} from '../../../../slices/userSlice';

import { closeSideContentFn } from '../../../../slices/dashboardSlice';

export interface EditUserProps {
  userId: string | number;
}

const EditUser: React.FC<EditUserProps> = ({ userId }: EditUserProps) => {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(getSingleUserFn(Number(userId)));
  };

  useEffect(fetchData, [dispatch, userId]);

  const userState = useSelector(selectUserState);

  const { data: user } = userState.singleUser;

  const deleteUser = () => {
    dispatch(
      deleteUserFn(Number(userId), () => {
        dispatch(getUsersFn());
        dispatch(closeSideContentFn());
      })
    );
  };

  const { fullName, username, role } = user;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        fullName: fullName || '',
        username: username || '',
        role: role || '',
      }}
      onSubmit={(values) => {
        dispatch(
          updateUserFn(values, Number(userId), () => {
            dispatch(closeSideContentFn());
            dispatch(getUsersFn());
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
            name="username"
            placeholder="Username"
            label="Username"
            type="text"
            component={TextInput}
          />

          <div className="field">
            <label htmlFor="role">Role</label>
            <Field
              id="role"
              name="role"
              component="select"
              className="ui dropdown"
            >
              <option value="" disabled hidden>
                Select Role
              </option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="newbie">Newbie</option>
            </Field>
          </div>
          <Button onClick={() => handleSubmit()} type="Submit" fluid primary>
            Update
          </Button>
          <Button
            style={{ marginTop: '1rem' }}
            onClick={deleteUser}
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
export default EditUser;
