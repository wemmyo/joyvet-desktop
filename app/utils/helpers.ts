export const numberWithCommas = (n: string) => {
  return parseFloat(n || '0')
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
};
