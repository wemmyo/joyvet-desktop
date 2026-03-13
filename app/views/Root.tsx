import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { Store } from '../store';
import Routes from '../routing/Routing';

type Props = {
  store: Store;
};

const Root = ({ store }: Props) => (
  <Provider store={store}>
    <HashRouter>
      <Routes />
    </HashRouter>
  </Provider>
);

export default Root;
