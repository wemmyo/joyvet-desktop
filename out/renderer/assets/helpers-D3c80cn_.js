import { g as getUserSession } from "./index-Bzxp2TFY.js";
const numberWithCommas = (n) => {
  if (typeof n !== "number" || Number.isNaN(n)) {
    return "";
  }
  return n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};
const isAdmin = () => {
  return getUserSession()?.role === "admin";
};
const sum = (prev, next) => {
  return prev + next;
};
export {
  isAdmin as i,
  numberWithCommas as n,
  sum as s
};
