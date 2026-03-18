import { r as reactExports, e as useSidebarContext, j as jsxRuntimeExports, B as Button, L as Link, d as routes } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { T as Table, d as TableBody, b as TableRow, e as TableCell, a as TableHeader, c as TableHead, D as DashboardLayout } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { n as numberWithCommas, i as isAdmin } from "./helpers-D3c80cn_.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { g as getSingleInvoiceFn, d as deleteInvoiceFn, R as ReceiptWrapper, f as filterInvoiceFn } from "./invoice.controller-d7K8AFkH.js";
const SalesDetail = ({ salesId, onRefresh }) => {
  const componentRef = reactExports.useRef(null);
  const { closeSideContent } = useSidebarContext();
  const [printInvoice, setPrintInvoice] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  const [sales, setSales] = reactExports.useState({});
  const handlePrint = Z({});
  const handlePrintFn = () => {
    setPrintInvoice(true);
  };
  reactExports.useEffect(() => {
    setPrintInvoice(false);
  }, [salesId]);
  reactExports.useEffect(() => {
    if (printInvoice) {
      handlePrint?.();
    }
  }, [printInvoice, handlePrint]);
  reactExports.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSingleInvoiceFn(Number(salesId));
      setSales(response);
      setLoading(false);
    };
    fetchData();
  }, [salesId]);
  const handleDeleteInvoice = async () => {
    await deleteInvoiceFn(Number(salesId));
    closeSideContent();
    onRefresh?.();
  };
  const renderInvoiceToPrint = () => {
    if (printInvoice) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptWrapper, { ref: componentRef, invoice: sales }) });
    }
    return null;
  };
  if (loading || !sales) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Invoice ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: sales.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: sales.customer?.fullName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: sales.saleType })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(sales.createdAt).format("DD/MM/YYYY") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(sales.createdAt).format("h:mm a") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(sales.amount)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Profit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(sales.profit)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Posted By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: sales.postedBy })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quantity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Unit Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sales.products?.map((order, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: index + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: order.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: order.invoiceItem?.quantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          order.invoiceItem?.unitPrice ? numberWithCommas(order.invoiceItem?.unitPrice) : "N/A"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          order.invoiceItem?.amount ? numberWithCommas(order.invoiceItem?.amount) : "N/A"
        ] })
      ] }, order.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", type: "button", onClick: handlePrintFn, children: "Print" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `${routes.INVOICE}/${salesId}`, children: "Edit" }) }),
      isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleDeleteInvoice,
          type: "button",
          variant: "destructive",
          children: "Delete"
        }
      ) : null
    ] }),
    renderInvoiceToPrint()
  ] });
};
const TODAYS_DATE = `${dayjs().format("YYYY-MM-DD")}`;
const CONTENT_DETAIL = "detail";
const SalesScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [salesId, setSalesId] = reactExports.useState();
  const [saleType, setSaleType] = reactExports.useState("all");
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [appliedSearch, setAppliedSearch] = reactExports.useState("");
  const [startDate, setStartDate] = reactExports.useState(TODAYS_DATE);
  const [endDate, setEndDate] = reactExports.useState(TODAYS_DATE);
  const [invoices, setInvoices] = reactExports.useState([]);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(false);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  const loadInvoices = reactExports.useCallback(
    async (nextPage) => {
      setLoading(true);
      const response = await filterInvoiceFn({
        page: nextPage,
        pageSize: DEFAULT_PAGE_SIZE,
        startDate,
        endDate,
        saleType,
        search: appliedSearch || void 0
      });
      setInvoices(response.rows ?? []);
      setTotal(response.total ?? 0);
      setLoading(false);
    },
    [appliedSearch, endDate, saleType, startDate]
  );
  reactExports.useEffect(() => {
    void loadInvoices(page);
  }, [loadInvoices, page]);
  reactExports.useEffect(() => {
    return () => {
      closeSideBar();
      setSideContent("");
      setSalesId(void 0);
    };
  }, [closeSideBar]);
  const openSingleSale = async (id) => {
    setSalesId(id);
    openSideContent(CONTENT_DETAIL);
  };
  const renderRows = invoices.map((each) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      TableRow,
      {
        onClick: () => openSingleSale(each.id),
        className: "cursor-pointer hover:bg-muted/50",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.customer?.fullName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.saleType }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            "₦",
            numberWithCommas(each.amount)
          ] }),
          isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            "₦",
            numberWithCommas(each.profit)
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(each.createdAt).format("DD/MM/YYYY") })
        ]
      },
      each.id
    );
  });
  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SalesDetail, { salesId: Number(salesId), onRefresh: fetchInvoices });
    }
    return null;
  };
  const resetFilters = () => {
    setStartDate(TODAYS_DATE);
    setEndDate(TODAYS_DATE);
    setSaleType("all");
    setSearchValue("");
    setAppliedSearch("");
    setPage(DEFAULT_PAGE);
  };
  const fetchInvoices = reactExports.useCallback(async () => {
    await loadInvoices(page);
  }, [loadInvoices, page]);
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: resetFilters, children: "Reset" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 flex-wrap", children: [
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
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "saleType", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: saleType, onValueChange: setSaleType, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transfer", children: "Transfer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash", children: "Cash" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "credit", children: "Credit" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "search", children: "Search" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "form",
            {
              onSubmit: (event) => {
                event.preventDefault();
                setAppliedSearch(searchValue.trim());
                setPage(DEFAULT_PAGE);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "search",
                  placeholder: "Invoice number",
                  onChange: (e) => {
                    const nextSearchValue = e.target.value;
                    setSearchValue(nextSearchValue);
                    if (nextSearchValue.trim() === "" && appliedSearch !== "") {
                      setAppliedSearch("");
                      setPage(DEFAULT_PAGE);
                    }
                  },
                  value: searchValue
                }
              )
            }
          )
        ] })
      ] })
    ] });
  };
  const sum = (prev, next) => {
    return prev + next;
  };
  const sumOfAmount = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices.map((item) => {
      return item.amount;
    }).reduce(sum);
  };
  const sumOfProfit = () => {
    if (invoices.length === 0) {
      return 0;
    }
    return invoices.map((item) => {
      return item.profit;
    }).reduce(sum);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DashboardLayout,
    {
      screenTitle: "Sales",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
            isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Profit" }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderRows })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaginationControls,
          {
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            total,
            onPageChange: setPage
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold flex gap-8 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Total: ₦",
            numberWithCommas(sumOfAmount())
          ] }),
          isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Profit Total: ₦",
            numberWithCommas(sumOfProfit())
          ] }) : null
        ] })
      ] })
    }
  );
};
export {
  SalesScreen as default
};
