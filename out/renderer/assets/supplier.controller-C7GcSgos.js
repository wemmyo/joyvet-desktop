import { u as ue, g as getUserSession } from "./index-Bzxp2TFY.js";
const emptySuppliers = (query) => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25
});
const getSupplierPaymentsFn = async (supplierId, startDate, endDate) => {
  try {
    return await window.api.payment.getBySupplier(
      supplierId,
      startDate || "",
      endDate || ""
    );
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
const getSupplierPurchasesFn = async (supplierId, startDate, endDate) => {
  try {
    return await window.api.purchase.getBySupplier(
      supplierId,
      startDate,
      endDate
    );
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
const searchSupplierFn = async (query) => {
  try {
    return await window.api.supplier.search(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptySuppliers(query);
  }
};
const deleteSupplierFn = async (id, cb) => {
  try {
    await window.api.supplier.delete(id);
    ue.success("Successfully deleted");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const updateSupplierFn = async (values, id, cb) => {
  try {
    await window.api.supplier.update(id, values);
    ue.success("Successfully updated, refresh to see changes", {
      duration: 5e3
    });
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const getSingleSupplierFn = async (id) => {
  try {
    return await window.api.supplier.getById(id);
  } catch (error) {
    ue.error(error.message || "");
    return null;
  }
};
const getSuppliersFn = async (query) => {
  try {
    return await window.api.supplier.getAll(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptySuppliers(query);
  }
};
const createSupplierFn = async (values, cb) => {
  try {
    const user = getUserSession();
    await window.api.supplier.create({
      ...values,
      postedBy: user?.fullName ?? ""
    });
    ue.success("Supplier successfully created");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
export {
  getSuppliersFn as a,
  getSupplierPaymentsFn as b,
  createSupplierFn as c,
  deleteSupplierFn as d,
  getSupplierPurchasesFn as e,
  getSingleSupplierFn as g,
  searchSupplierFn as s,
  updateSupplierFn as u
};
