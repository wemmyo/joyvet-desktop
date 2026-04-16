interface ActiveSession {
  id: number;
  role: string;
  fullName: string;
}

let activeSession: ActiveSession | null = null;

export const setActiveSession = (session: ActiveSession | null): void => {
  activeSession = session;
};

export const getActiveSession = (): ActiveSession | null => activeSession;

export const requireRole = (roles: string[]): void => {
  if (!activeSession) {
    throw new Error('Not authenticated');
  }
  if (!roles.includes(activeSession.role)) {
    throw new Error('You do not have permission to perform this action');
  }
};
