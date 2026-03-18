import { r as reactExports, j as jsxRuntimeExports, u as ue, g as getUserSession } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { n as numberWithCommas } from "./helpers-D3c80cn_.js";
const receipt = "_receipt_zgah8_1";
const receipt__companyInfo = "_receipt__companyInfo_zgah8_11";
const styles = {
  receipt,
  receipt__companyInfo
};
const ReceiptWrapper = reactExports.forwardRef(
  ({ invoice }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: styles.receipt, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: styles.receipt__companyInfo, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { children: "JOY VETERINARY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "37, Iganmode Road",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "Ota, Ogun State",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "08027634893 ,08095988354, 07076224865"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Sales Invoice!" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("hr", {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Customer:",
        invoice?.customer?.fullName || "VALUED CUSTOMER"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Invoice#:",
        invoice.id
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Transaction Date:",
        dayjs(invoice.createdAt).format("DD/MM/YYYY")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border px-2 py-1 text-left", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border px-2 py-1 text-left", children: "Qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border px-2 py-1 text-left", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border px-2 py-1 text-left", children: "Amount" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          invoice.products ? invoice.products.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border px-2 py-1", children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border px-2 py-1", children: item.invoiceItem?.quantity }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "border px-2 py-1", children: [
              "₦",
              item.invoiceItem?.unitPrice ? numberWithCommas(item.invoiceItem.unitPrice) : 0
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "border px-2 py-1", children: [
              "₦",
              item.invoiceItem?.amount ? numberWithCommas(item.invoiceItem.amount) : 0
            ] })
          ] }, item.id)) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border px-2 py-1", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border px-2 py-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border px-2 py-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "border px-2 py-1", children: [
              "₦",
              numberWithCommas(invoice.amount)
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Cashier:",
        invoice.postedBy
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Please, Ensure you check all item(s) given to you with your invoice before leaving the counter." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Products sold in good condition cannot be returned." }) })
    ] });
  }
);
ReceiptWrapper.displayName = "ReceiptWrapper";
const filterInvoiceFn = async (query) => {
  try {
    return await window.api.invoice.filter(query);
  } catch (error) {
    ue.error(error.message || "");
    throw error;
  }
};
const getSingleInvoiceFn = async (id, cb) => {
  try {
    const invoice = await window.api.invoice.getSingle(id);
    if (cb) ;
    return invoice;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const deleteInvoiceFn = async (id, cb) => {
  try {
    await window.api.invoice.delete(id);
    ue.success("Invoice deleted successfully.");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
    throw error;
  }
};
const deleteInvoiceItemFn = async ({
  productId,
  invoiceId,
  invoiceItemId,
  cb
}) => {
  try {
    await window.api.invoice.deleteItem({
      productId,
      invoiceId,
      invoiceItemId
    });
    ue.success("Invoice item deleted successfully");
    if (cb) cb();
  } catch (error) {
    ue.error(error.message || "");
    throw error;
  }
};
const addInvoiceItemFn = async (currentInvoice, currentInvoiceItem) => {
  try {
    await window.api.invoice.addItem(currentInvoice, currentInvoiceItem);
    ue.success("Successfully updated item in the invoice");
  } catch (error) {
    ue.error(error.message || "");
    throw error;
  }
};
const createInvoiceFn = async (invoiceItems, invoice, cb) => {
  try {
    const user = getUserSession();
    const result = await window.api.invoice.create(invoiceItems, {
      ...invoice,
      postedBy: user?.fullName ?? ""
    });
    ue.success("Invoice created");
    if (cb && result?.id) cb(result.id);
  } catch (error) {
    ue.error(error.message || "");
  }
};
export {
  ReceiptWrapper as R,
  deleteInvoiceItemFn as a,
  addInvoiceItemFn as b,
  createInvoiceFn as c,
  deleteInvoiceFn as d,
  filterInvoiceFn as f,
  getSingleInvoiceFn as g
};
