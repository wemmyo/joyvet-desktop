export const numberWithCommas = (n: number) => {
  if (!n || typeof n !== 'number') {
    return '';
  }

  // add commas to n and 2 decimal places
  return n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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
