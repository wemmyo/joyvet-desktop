import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { RightPanelProvider } from '../../contexts/SidebarContext';
import Routes from '../../routing/Routing';
import '../../app.global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

root.render(
  <RightPanelProvider>
    <HashRouter>
      <Routes />
    </HashRouter>
  </RightPanelProvider>
);

if (import.meta.hot) {
  import.meta.hot.accept();
}
