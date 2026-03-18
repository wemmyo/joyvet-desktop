import { u as ue, g as getUserSession } from "./index-Bzxp2TFY.js";
const emptyPurchases = (query) => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25
});
const searchPurchaseFn = async (query) => {
  try {
    return await window.api.purchase.search(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyPurchases(query);
  }
};
const getSinglePurchaseFn = async (id, cb) => {
  try {
    const purchase = await window.api.purchase.getById(id);
    if (cb) ;
    return purchase;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const getPurchasesFn = async (query) => {
  try {
    return await window.api.purchase.getAll(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyPurchases(query);
  }
};
const createPurchaseFn = async (values, meta, cb) => {
  try {
    const user = getUserSession();
    await window.api.purchase.create(values, {
      ...meta,
      postedBy: user?.fullName ?? ""
    });
    ue.success("Purchase created");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const deletePurchaseFn = async (id, cb) => {
  try {
    await window.api.purchase.delete(id);
    ue.success("Purchase deleted");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
export {
  getPurchasesFn as a,
  createPurchaseFn as c,
  deletePurchaseFn as d,
  getSinglePurchaseFn as g,
  searchPurchaseFn as s
};
