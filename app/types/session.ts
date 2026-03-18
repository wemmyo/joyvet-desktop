export interface UserSession {
  id: number;
  fullName: string;
  role: string;
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const sanitizeUserSession = (value: unknown): UserSession | null => {
  if (!isObject(value)) {
    return null;
  }

  const { id, fullName, role } = value;

  if (
    typeof id !== 'number' ||
    Number.isNaN(id) ||
    typeof fullName !== 'string' ||
    fullName.trim() === '' ||
    typeof role !== 'string' ||
    role.trim() === ''
  ) {
    return null;
  }

  return {
    id,
    fullName,
    role,
  };
};
