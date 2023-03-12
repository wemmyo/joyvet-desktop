export const numberWithCommas = (n: number) => {
  return parseFloat(n.toString())
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};

export const isAdmin = () => {
  const loggedInUserRaw = localStorage.getItem('user');
  const loggedInUserRole = loggedInUserRaw
    ? JSON.parse(loggedInUserRaw).role
    : '';

  if (loggedInUserRole === 'admin') {
    return true;
  }
  return false;
};

export const sum = (prev: number, next: number) => {
  return prev + next;
};
