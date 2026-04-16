import { isAdmin, numberWithCommas, sum } from '../helpers';
import { setUserSession } from '../session';

describe('numberWithCommas', () => {
  it('formats number with commas and 2 decimal places', () => {
    expect(numberWithCommas(1234567.89)).toBe('1,234,567.89');
  });
  it('formats zero and returns empty string for invalid input', () => {
    expect(numberWithCommas(0)).toBe('0.00');
    expect(numberWithCommas(null as any)).toBe('');
  });
  it('formats small number', () => {
    expect(numberWithCommas(100)).toBe('100.00');
  });
});

describe('isAdmin', () => {
  beforeEach(() => localStorage.clear());

  it('returns false when no user in localStorage', () => {
    expect(isAdmin()).toBe(false);
  });
  it('returns true when user role is admin', () => {
    setUserSession({ id: 1, fullName: 'Admin User', role: 'admin' });
    expect(isAdmin()).toBe(true);
  });
  it('returns false when user role is not admin', () => {
    setUserSession({ id: 2, fullName: 'Cashier User', role: 'cashier' });
    expect(isAdmin()).toBe(false);
  });
});

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
    expect(sum(0, 0)).toBe(0);
    expect(sum(-1, 1)).toBe(0);
  });
});
