import { j as jsxRuntimeExports, r as reactExports, o as useParams, B as Button } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, D as DashboardLayout } from "./table-CxVkuaOT.js";
import { i as isAdmin, n as numberWithCommas, s as sum } from "./helpers-D3c80cn_.js";
import { b as getCustomerInvoicesFn, e as getCustomerReceiptsFn } from "./customer.controller-CcI8DpcE.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { P as Printer } from "./printer-BxDK0O1H.js";
const CustomerHistoryInvoices = ({
  data
}) => {
  const renderInvoices = () => {
    const allInvoices = data.map((invoice) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.saleType }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.amount)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(invoice.createdAt).format("DD/MM/YY, h:mm a") })
      ] }, invoice.id);
    });
    return allInvoices;
  };
  const sumOfAmounts = () => {
    if (data.length === 0) {
      return 0;
    }
    return data.map((item) => {
      return item.amount;
    }).reduce(sum);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sale Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date & Time" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderInvoices() })
    ] }),
    isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-right font-semibold", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts())
    ] }) : null
  ] });
};
const CustomerHistoryReceipts = ({
  data
}) => {
  const renderInvoices = () => {
    const allInvoices = data.map((invoice) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.paymentMethod }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.amount)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(invoice.createdAt).format("DD/MM/YY, h:mm a") })
      ] }, invoice.id);
    });
    return allInvoices;
  };
  const sumOfAmounts = () => {
    if (data.length === 0) {
      return 0;
    }
    return data.map((item) => {
      return item.amount;
    }).reduce(sum);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date & Time" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderInvoices() })
    ] }),
    isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-right font-semibold", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts())
    ] }) : null
  ] });
};
const TODAYS_DATE = `${dayjs().format("YYYY-MM-DD")}`;
const CustomerHistory = () => {
  const [startDate, setStartDate] = reactExports.useState(TODAYS_DATE);
  const [endDate, setEndDate] = reactExports.useState(TODAYS_DATE);
  const [receipts, setReceipts] = reactExports.useState([]);
  const [invoices, setInvoices] = reactExports.useState([]);
  const [activeTab, setActiveTab] = reactExports.useState("Receipts");
  const { id } = useParams();
  const customerId = Number(id);
  const hasValidCustomerId = Number.isInteger(customerId) && customerId > 0;
  const componentRef = reactExports.useRef(null);
  const handlePrint = Z({});
  reactExports.useEffect(() => {
    if (!hasValidCustomerId) {
      setInvoices([]);
      setReceipts([]);
      return;
    }
    const fetchData = async () => {
      const getInvoices = getCustomerInvoicesFn(customerId, startDate, endDate);
      const getReceipts = getCustomerReceiptsFn(customerId, startDate, endDate);
      const [invoicesResponse, receiptsResponse] = await Promise.all([
        getInvoices,
        getReceipts
      ]);
      setInvoices(invoicesResponse || []);
      setReceipts(receiptsResponse || []);
    };
    fetchData();
  }, [customerId, endDate, hasValidCustomerId, startDate]);
  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };
  const tabs = ["Receipts", "Invoices"];
  if (!hasValidCustomerId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Customer History", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Invalid customer selected." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Customer History", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: componentRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: handlePrint, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startDate", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "startDate",
              type: "date",
              value: startDate,
              onChange: (e) => setStartDate(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "endDate", children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "endDate",
              type: "date",
              value: endDate,
              onChange: (e) => setEndDate(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: resetFilters, className: "self-end", children: "Reset" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b mb-4", children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab(tab),
          className: `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: tab
        },
        tab
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        activeTab === "Receipts" && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerHistoryReceipts, { data: receipts }),
        activeTab === "Invoices" && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerHistoryInvoices, { data: invoices })
      ] })
    ] })
  ] }) });
};
export {
  CustomerHistory as default
};
