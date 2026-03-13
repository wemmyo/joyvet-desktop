import React, { useEffect, useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import { useAppDispatch } from '../../../../hooks';

import TextInput from '../../../../components/TextInput/TextInput';

import { closeSideContentFn } from '../../../../slices/dashboardSlice';
import {
  getSingleUserFn,
  deleteUserFn,
  getUsersFn,
  updateUserFn,
} from '../../../../controllers/user.controller';
import { IUser } from '../../../../models/user';

export interface EditUserProps {
  userId: string | number;
}

const EditUser: React.FC<EditUserProps> = ({ userId }: EditUserProps) => {
  const [user, setUser] = useState<IUser>({} as IUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleUserFn(Number(userId));
      setUser(response);
    };
    fetchData();
  }, [dispatch, userId]);

  const deleteUser = async () => {
    await deleteUserFn(Number(userId));
    await getUsersFn();
    dispatch(closeSideContentFn());
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
      onSubmit={async (values) => {
        await updateUserFn(values, Number(userId));
        dispatch(closeSideContentFn());
        await getUsersFn();
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
          <Button onClick={() => handleSubmit()} type="submit" fluid primary>
            Update
          </Button>
          <Button
            style={{ marginTop: '1rem' }}
            onClick={deleteUser}
            type="submit"
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
