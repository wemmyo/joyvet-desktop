import { getUserSession } from './session';

export const numberWithCommas = (n: number) => {
  if (typeof n !== 'number' || Number.isNaN(n)) {
    return '';
  }

  // add commas to n and 2 decimal places
  return n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

export const isAdmin = () => {
  return getUserSession()?.role === 'admin';
};

export const sum = (prev: number, next: number) => {
  return prev + next;
};
