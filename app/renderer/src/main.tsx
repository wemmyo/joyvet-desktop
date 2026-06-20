import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { RightPanelProvider } from '../../contexts/SidebarContext';
import Routes from '../../routing/Routing';
import { getUserSession } from '../../utils/session';
import '../../app.global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

const renderApp = () => {
  root.render(
    <RightPanelProvider>
      <HashRouter>
        <Routes />
      </HashRouter>
    </RightPanelProvider>
  );
};

// The renderer persists the session in localStorage, but the main process
// holds the authoritative role for IPC permission checks and loses it on
// restart. Re-establish it before mounting so admin-gated actions don't fail
// with "Not authenticated" after a reload. Render regardless if it fails.
const bootstrap = async () => {
  const session = getUserSession();
  if (session?.id) {
    try {
      await window.api.user.restoreSession(session.id);
    } catch {
      // Non-fatal: the user can re-login if permission checks fail.
    }
  }
  renderApp();
};

void bootstrap();

if (import.meta.hot) {
  import.meta.hot.accept();
}
