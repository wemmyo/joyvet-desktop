import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { configuredStore } from '../../store';
import Routes from '../../routing/Routing';
import '../../app.global.css';

const store = configuredStore();

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <HashRouter>
      <Routes />
    </HashRouter>
  </Provider>
);

if (import.meta.hot) {
  import.meta.hot.accept();
}
