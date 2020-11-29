import * as React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import TextInput from '../../../../components/TextInput/TextInput';

export interface CreateUserProps {
  createUserFn: (values: any) => void;
}

const CreateUserSchema = Yup.object().shape({
  fullName: Yup.string().required('Required'),
});

const CreateUser: React.FC<CreateUserProps> = ({ createUserFn }) => {
  return (
    <Formik
      initialValues={{
        fullName: '',
        username: '',
        password: '',
        role: '',
      }}
      validationSchema={CreateUserSchema}
      onSubmit={(values, actions) => {
        createUserFn(values);
        actions.resetForm();
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
          <Field
            name="password"
            placeholder="Password"
            label="Password"
            type="password"
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
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default CreateUser;
