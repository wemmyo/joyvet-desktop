import React from 'react';
import { HashRouter } from 'react-router-dom';
import { RightPanelProvider } from '../contexts/SidebarContext';
import Routes from '../routing/Routing';

const Root = () => (
  <RightPanelProvider>
    <HashRouter>
      <Routes />
    </HashRouter>
  </RightPanelProvider>
);

export default Root;
