import { j as jsxRuntimeExports, r as reactExports, o as useParams, B as Button } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, D as DashboardLayout } from "./table-CxVkuaOT.js";
import { i as isAdmin, n as numberWithCommas, s as sum } from "./helpers-D3c80cn_.js";
import { b as getSupplierPaymentsFn, e as getSupplierPurchasesFn } from "./supplier.controller-C7GcSgos.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
const CustomerHistoryPayments = ({
  data
}) => {
  const renderPayments = () => {
    const allPayments = data.map((payment) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: payment.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(payment.amount)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: payment.paymentMethod }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: payment.bank }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(payment.createdAt).format("DD/MM/YY, h:mm a") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: payment.note })
      ] }, payment.id);
    });
    return allPayments;
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Bank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date & Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Note" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderPayments() })
    ] }),
    isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-right font-semibold", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts())
    ] }) : null
  ] });
};
const CustomerHistoryPurchases = ({
  data
}) => {
  const renderPurchases = () => {
    const allPurchases = data.map((invoice) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.invoiceNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.amount)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(invoice.createdAt).format("DD/MM/YY, h:mm a") })
      ] }, invoice.id);
    });
    return allPurchases;
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Purchase ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date & Time" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderPurchases() })
    ] }),
    isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-right font-semibold", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts())
    ] }) : null
  ] });
};
const TODAYS_DATE = `${dayjs().format("YYYY-MM-DD")}`;
const SuppplierHistory = () => {
  const [startDate, setStartDate] = reactExports.useState(TODAYS_DATE);
  const [endDate, setEndDate] = reactExports.useState(TODAYS_DATE);
  const [payments, setPayments] = reactExports.useState([]);
  const [purchases, setPurchases] = reactExports.useState([]);
  const [activeTab, setActiveTab] = reactExports.useState("Purchases");
  const { id } = useParams();
  const supplierId = Number(id);
  const hasValidSupplierId = Number.isInteger(supplierId) && supplierId > 0;
  reactExports.useEffect(() => {
    if (!hasValidSupplierId) {
      setPayments([]);
      setPurchases([]);
      return;
    }
    const fetchData = async () => {
      const getPayments = getSupplierPaymentsFn(supplierId, startDate, endDate);
      const getPurchases = getSupplierPurchasesFn(
        supplierId,
        startDate,
        endDate
      );
      const [paymentsResponse, purchasesResponse] = await Promise.all([
        getPayments,
        getPurchases
      ]);
      setPayments(paymentsResponse || []);
      setPurchases(purchasesResponse || []);
    };
    fetchData();
  }, [endDate, hasValidSupplierId, startDate, supplierId]);
  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };
  const tabs = ["Purchases", "Payments"];
  if (!hasValidSupplierId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Supplier History", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Invalid supplier selected." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DashboardLayout, { screenTitle: "Supplier History", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 mb-4", children: [
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
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: resetFilters, children: "Reset" })
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
        activeTab === "Purchases" && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerHistoryPurchases, { data: purchases }),
        activeTab === "Payments" && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerHistoryPayments, { data: payments })
      ] })
    ] })
  ] });
};
export {
  SuppplierHistory as default
};
