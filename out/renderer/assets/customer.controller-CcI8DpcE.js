import { u as ue, g as getUserSession } from "./index-Bzxp2TFY.js";
const emptyCustomers = (query) => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25
});
const getCustomersFn = async (query) => {
  try {
    return await window.api.customer.getAll(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyCustomers(query);
  }
};
const createCustomerFn = async (values, cb) => {
  try {
    const user = getUserSession();
    const customer = await window.api.customer.create({
      ...values,
      postedBy: user?.fullName ?? ""
    });
    ue.success("Successfully created");
    if (cb) ;
    return customer;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const updateCustomerFn = async (values, id, cb) => {
  try {
    await window.api.customer.update(id, values);
    ue.success("Successfully updated, refresh to see changes");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const deleteCustomerFn = async (id, cb) => {
  try {
    await window.api.customer.delete(id);
    ue.success("Successfully deleted");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const getSingleCustomerFn = async (id, cb) => {
  try {
    const customer = await window.api.customer.getById(id);
    if (cb) ;
    return customer;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const searchCustomerFn = async (query) => {
  try {
    return await window.api.customer.search(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyCustomers(query);
  }
};
const getCustomerInvoicesFn = async (customerId, startDate, endDate) => {
  try {
    return await window.api.customer.getInvoices(
      customerId,
      startDate,
      endDate
    );
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
const getCustomerReceiptsFn = async (customerId, startDate, endDate) => {
  try {
    return await window.api.customer.getReceipts(
      customerId,
      startDate,
      endDate
    );
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
export {
  getCustomersFn as a,
  getCustomerInvoicesFn as b,
  createCustomerFn as c,
  deleteCustomerFn as d,
  getCustomerReceiptsFn as e,
  getSingleCustomerFn as g,
  searchCustomerFn as s,
  updateCustomerFn as u
};
