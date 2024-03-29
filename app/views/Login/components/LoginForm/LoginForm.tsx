import * as React from 'react';
import { Button, Form, Grid, Segment, Header } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import routes from '../../../../routing/routes';
import TextInput from '../../../../components/TextInput/TextInput';
import { loginUserFn } from '../../../../controllers/user.controller';

const CreateProductSchema = Yup.object().shape({
  username: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
});
// export interface LoginFormProps {}

const LoginForm = () => {
  const history = useHistory();

  return (
    <Grid centered style={{ height: '100vh' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="black" textAlign="center">
          Login to your account
        </Header>
        <Formik
          initialValues={{
            username: '',
            password: '',
          }}
          validationSchema={CreateProductSchema}
          onSubmit={async (values, actions) => {
            await loginUserFn(values);
            history.push(routes.INVOICE);
            actions.resetForm();
          }}
        >
          {({ handleSubmit }) => (
            <Form>
              <Segment stacked>
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
                <Button
                  onClick={() => handleSubmit()}
                  type="Submit"
                  fluid
                  primary
                >
                  Login
                </Button>
              </Segment>
            </Form>
          )}
        </Formik>
      </Grid.Column>
    </Grid>
  );
};

export default LoginForm;
