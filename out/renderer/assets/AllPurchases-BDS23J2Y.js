import { r as reactExports, e as useSidebarContext, j as jsxRuntimeExports, B as Button } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { T as Table, d as TableBody, b as TableRow, e as TableCell, a as TableHeader, c as TableHead, D as DashboardLayout } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { n as numberWithCommas, i as isAdmin } from "./helpers-D3c80cn_.js";
import { g as getSinglePurchaseFn, d as deletePurchaseFn, a as getPurchasesFn, s as searchPurchaseFn } from "./purchase.controller-DIv4x-U5.js";
import { R as RefreshCw } from "./refresh-cw-DEY85FrQ.js";
const SalesDetail = ({
  purchaseId
}) => {
  const [purchase, setPurchase] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const { closeSideContent } = useSidebarContext();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSinglePurchaseFn(Number(purchaseId));
      setPurchase(response);
      setLoading(false);
    };
    fetchData();
  }, [purchaseId]);
  const handleDelete = async () => {
    await deletePurchaseFn(purchaseId);
    await getPurchasesFn();
    closeSideContent();
  };
  const renderOrders = () => {
    let serialNumber = 0;
    const orderList = purchase.products?.map((order) => {
      serialNumber += 1;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: serialNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: order.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: order.purchaseItem.quantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(order.purchaseItem.unitPrice)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          "₦",
          numberWithCommas(order.purchaseItem.amount)
        ] })
      ] }, order.id);
    });
    return orderList;
  };
  if (loading || !purchase) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Invoice Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: purchase.invoiceNumber })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: purchase.supplier?.fullName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(purchase.amount) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Date Posted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(purchase.createdAt).format("DD/MM/YYYY") })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderOrders() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        disabled: !isAdmin(),
        onClick: () => handleDelete(),
        variant: "destructive",
        children: "Delete"
      }
    )
  ] });
};
const CONTENT_DETAIL = "detail";
const AllPurchasesScreen = () => {
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const [sideContent, setSideContent] = reactExports.useState("");
  const [purchaseId, setPurchasesId] = reactExports.useState("");
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [appliedSearch, setAppliedSearch] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [purchases, setPurchases] = reactExports.useState([]);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  const fetchPurchases = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    const paginatedResponse = search ? await searchPurchaseFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE,
      search
    }) : await getPurchasesFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE
    });
    setPurchases(paginatedResponse.rows ?? []);
    setTotal(paginatedResponse.total ?? 0);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    void fetchPurchases(page, appliedSearch);
    return () => {
      closeSideBar();
      setSideContent("");
      setPurchasesId("");
    };
  }, [appliedSearch, page]);
  const openSinglePurchase = (id) => {
    setPurchasesId(id);
    openSideContent(CONTENT_DETAIL);
  };
  const renderRows = () => {
    const rows = purchases.map((each) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          onClick: () => openSinglePurchase(each.id),
          className: "cursor-pointer hover:bg-muted/50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.invoiceNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each?.supplier?.fullName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.amount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(each.createdAt).format("DD-MM-YYYY") })
          ]
        },
        each.id
      );
    });
    return rows;
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SalesDetail, { purchaseId });
    }
    return null;
  };
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchValue(value);
    if (value.trim() === "" && appliedSearch !== "") {
      setAppliedSearch("");
      setPage(DEFAULT_PAGE);
    }
  };
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
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
              placeholder: "Search Invoice Number",
              onChange: handleSearchChange,
              value: searchValue
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => {
            void fetchPurchases(page, appliedSearch);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1 h-4 w-4" }),
            "Refresh"
          ]
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DashboardLayout,
    {
      screenTitle: "Purchases",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Invoice Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderRows() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaginationControls,
          {
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            total,
            onPageChange: setPage
          }
        )
      ] })
    }
  );
};
export {
  AllPurchasesScreen as default
};
