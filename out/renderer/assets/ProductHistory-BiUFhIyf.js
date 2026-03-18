import { j as jsxRuntimeExports, r as reactExports, o as useParams, B as Button } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, D as DashboardLayout } from "./table-CxVkuaOT.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { i as isAdmin, n as numberWithCommas, s as sum } from "./helpers-D3c80cn_.js";
import { b as getProductInvoicesFn, e as getProductPurchasesFn } from "./product.controller-SMDalRLo.js";
const ProductHistoryInvoices = ({
  data
}) => {
  const renderInvoices = () => {
    const allInvoices = data.map((invoice) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.invoiceId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.quantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.unitPrice)
        ] }),
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quantity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Unit Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date & Time" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderInvoices() })
    ] }),
    isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold text-right", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts())
    ] }) : null
  ] });
};
const ProductHistoryPurchases = ({
  data
}) => {
  const renderPurchases = () => {
    const allPurchases = data.map((invoice) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.purchaseId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.quantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.unitPrice)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.amount)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.sellPrice)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.sellPrice2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.sellPrice3)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.oldBuyPrice)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.oldSellPrice)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.oldSellPrice2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(invoice.oldSellPrice3)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(invoice.oldStockLevel) }),
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Purchase ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quantity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Unit Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sell Price 1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sell Price 2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Sell Price 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Prv. Buy Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Prv. Price 1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Prv. Price 2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Prv. Price 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Prv. Stock Level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date & Time" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderPurchases() })
    ] }),
    isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold text-right", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts())
    ] }) : null
  ] });
};
const TODAYS_DATE = `${dayjs().format("YYYY-MM-DD")}`;
const ProductHistory = () => {
  const [startDate, setStartDate] = reactExports.useState(TODAYS_DATE);
  const [endDate, setEndDate] = reactExports.useState(TODAYS_DATE);
  const [activeTab, setActiveTab] = reactExports.useState(
    "purchases"
  );
  const { id } = useParams();
  const productId = Number(id);
  const hasValidProductId = Number.isInteger(productId) && productId > 0;
  const [invoices, setInvoices] = reactExports.useState([]);
  const [purchases, setPurchases] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!hasValidProductId) {
      setInvoices([]);
      setPurchases([]);
      return;
    }
    const fetchData = async () => {
      const getInvoices = getProductInvoicesFn(productId, startDate, endDate);
      const getReceipts = getProductPurchasesFn(productId, startDate, endDate);
      const [invoicesResponse, receiptsResponse] = await Promise.all([
        getInvoices,
        getReceipts
      ]);
      setInvoices(invoicesResponse || []);
      setPurchases(receiptsResponse || []);
    };
    fetchData();
  }, [endDate, hasValidProductId, productId, startDate]);
  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
  };
  if (!hasValidProductId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Product History", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Invalid product selected." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DashboardLayout, { screenTitle: "Product History", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-wrap mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startDate", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "startDate",
              type: "date",
              onChange: (e) => setStartDate(e.target.value),
              value: startDate
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "endDate", children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "endDate",
              type: "date",
              onChange: (e) => setEndDate(e.target.value),
              value: endDate
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: resetFilters, className: "mt-5", children: "Reset" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setActiveTab("purchases"),
            className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "purchases" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
            children: "Purchases"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setActiveTab("invoices"),
            className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "invoices" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
            children: "Invoices"
          }
        )
      ] }),
      activeTab === "purchases" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProductHistoryPurchases, { data: purchases }),
      activeTab === "invoices" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProductHistoryInvoices, { data: invoices })
    ] })
  ] });
};
export {
  ProductHistory as default
};
