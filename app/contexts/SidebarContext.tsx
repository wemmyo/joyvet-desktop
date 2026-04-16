import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

interface RightPanelContextValue {
  sideContentisOpen: boolean;
  openSideContent: () => void;
  closeSideContent: () => void;
}

const RightPanelContext = createContext<RightPanelContextValue>({
  sideContentisOpen: false,
  openSideContent: () => {},
  closeSideContent: () => {},
});

export const RightPanelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sideContentisOpen, setSideContentisOpen] = useState(false);

  const openSideContent = useCallback(() => setSideContentisOpen(true), []);
  const closeSideContent = useCallback(() => setSideContentisOpen(false), []);

  return (
    <RightPanelContext.Provider
      value={{ sideContentisOpen, openSideContent, closeSideContent }}
    >
      {children}
    </RightPanelContext.Provider>
  );
};

export const useSidebarContext = () => useContext(RightPanelContext);
