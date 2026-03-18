import { u as ue, g as getUserSession } from "./index-Bzxp2TFY.js";
const emptyProducts = (query) => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25
});
const getProductsFn = async (query) => {
  try {
    return await window.api.product.getAll(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyProducts(query);
  }
};
const createProductFn = async (values, cb) => {
  try {
    const user = getUserSession();
    await window.api.product.create({
      ...values,
      postedBy: user?.fullName ?? ""
    });
    ue.success("Successfully created");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const updateProductFn = async (values, id, cb) => {
  try {
    await window.api.product.update(id, values);
    ue.success("Successfully updated");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const getSingleProductFn = async (id, cb) => {
  try {
    const product = await window.api.product.getById(id);
    if (cb) ;
    return product;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const deleteProductFn = async (id, cb) => {
  try {
    await window.api.product.delete(id);
    ue.success("Successfully deleted");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const searchProductFn = async (query) => {
  try {
    return await window.api.product.search(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyProducts(query);
  }
};
const getProductInvoicesFn = async (productId, startDate, endDate) => {
  try {
    return await window.api.product.getInvoices(productId, startDate, endDate);
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
const getProductPurchasesFn = async (productId, startDate, endDate) => {
  try {
    return await window.api.product.getPurchases(
      productId,
      startDate,
      endDate
    );
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
export {
  getSingleProductFn as a,
  getProductInvoicesFn as b,
  createProductFn as c,
  deleteProductFn as d,
  getProductPurchasesFn as e,
  getProductsFn as g,
  searchProductFn as s,
  updateProductFn as u
};
