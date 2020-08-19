import * as React from 'react';
import { Button, Form, Grid, Segment, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import routes from '../../../../constants/routes.json';

// export interface LoginFormProps {}

const LoginForm = () => {
  return (
    <Grid centered style={{ height: '100vh' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="black" textAlign="center">
          Login to your account
        </Header>
        <Form>
          <Segment stacked>
            <Form.Field>
              <label htmlFor="username">Username</label>
              <input id="username" placeholder="Username" />
            </Form.Field>
            <Form.Field>
              <label htmlFor="password">Password</label>
              <input id="password" placeholder="Password" type="password" />
            </Form.Field>
            <Button fluid>Login</Button>
          </Segment>
          <Link to={routes.OVERVIEW}>to Overview</Link>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default LoginForm;
