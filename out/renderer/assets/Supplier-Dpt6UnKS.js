import { j as jsxRuntimeExports, B as Button, r as reactExports, e as useSidebarContext, L as Link, d as routes } from "./index-Bzxp2TFY.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { D as DashboardLayout, T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { u as useForm, t, o as objectType, s as stringType } from "./types-eVLlK2xq.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { i as isAdmin, n as numberWithCommas, s as sum } from "./helpers-D3c80cn_.js";
import { g as getSingleSupplierFn, u as updateSupplierFn, a as getSuppliersFn, d as deleteSupplierFn, s as searchSupplierFn, c as createSupplierFn } from "./supplier.controller-C7GcSgos.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
import { R as RefreshCw } from "./refresh-cw-DEY85FrQ.js";
import { P as Printer } from "./printer-BxDK0O1H.js";
const schema = objectType({
  fullName: stringType().min(1, "Required"),
  address: stringType().optional().default(""),
  phoneNumber: stringType().optional().default(""),
  balance: stringType().optional().default("")
});
const CreateSupplier = ({
  createSupplierFn: createSupplierFn2
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(schema),
    defaultValues: {
      fullName: "",
      address: "",
      phoneNumber: "",
      balance: ""
    }
  });
  const onSubmit = (values) => {
    createSupplierFn2(values);
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "fullName",
          placeholder: "Full Name",
          type: "text",
          ...register("fullName")
        }
      ),
      errors.fullName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.fullName.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "address",
          placeholder: "Address",
          type: "text",
          ...register("address")
        }
      ),
      errors.address && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.address.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phoneNumber", children: "Phone Number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "phoneNumber",
          placeholder: "Phone Number",
          type: "tel",
          ...register("phoneNumber")
        }
      ),
      errors.phoneNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.phoneNumber.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "balance", children: "Balance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "balance",
          placeholder: "Balance",
          type: "number",
          ...register("balance")
        }
      ),
      errors.balance && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.balance.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save" })
  ] });
};
const EditSupplier = ({
  supplierId
}) => {
  const [supplier, setSupplier] = reactExports.useState({});
  const [values, setValues] = reactExports.useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    balance: ""
  });
  const { closeSideContent } = useSidebarContext();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleSupplierFn(supplierId);
      setSupplier(response);
      setValues({
        fullName: response.fullName || "",
        address: response.address || "",
        phoneNumber: response.phoneNumber || "",
        balance: String(response.balance || "")
      });
    };
    fetchData();
  }, [supplierId]);
  const handleDeleteSupplier = async () => {
    await deleteSupplierFn(supplierId);
    closeSideContent();
    await getSuppliersFn();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSupplierFn(values, supplierId);
    closeSideContent();
    await getSuppliersFn();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "fullName",
          placeholder: "Full Name",
          type: "text",
          value: values.fullName,
          onChange: (e) => setValues({ ...values, fullName: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "address",
          placeholder: "Address",
          type: "text",
          value: values.address,
          onChange: (e) => setValues({ ...values, address: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phoneNumber", children: "Phone Number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "phoneNumber",
          placeholder: "Phone Number",
          type: "tel",
          value: values.phoneNumber,
          onChange: (e) => setValues({ ...values, phoneNumber: e.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "balance", children: "Balance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "balance",
          placeholder: "Balance",
          type: "number",
          value: values.balance,
          onChange: (e) => setValues({ ...values, balance: e.target.value }),
          disabled: !isAdmin()
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "default", children: "Update" }),
      isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleDeleteSupplier,
          type: "button",
          variant: "destructive",
          children: "Delete"
        }
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `${routes.SUPPLIER}/${supplierId}`, children: "History" }) })
    ] })
  ] });
};
const CONTENT_CREATE = "create";
const CONTENT_EDIT = "edit";
const SuppliersScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [supplierId, setSupplierId] = reactExports.useState("");
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [appliedSearch, setAppliedSearch] = reactExports.useState("");
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const componentRef = reactExports.useRef(null);
  const handlePrint = Z({});
  const fetchSuppliers = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    const response = search ? await searchSupplierFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE,
      search
    }) : await getSuppliersFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE
    });
    setSuppliers(response.rows ?? []);
    setTotal(response.total ?? 0);
    setLoading(false);
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    void fetchSuppliers(page, appliedSearch);
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setSupplierId("");
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);
  const handleNewSupplier = async (values) => {
    await createSupplierFn(values);
    fetchSuppliers();
  };
  const openSingleSupplier = (id) => {
    setSupplierId(id);
    openSideContent(CONTENT_EDIT);
  };
  const renderRows = () => {
    const rows = suppliers.map((each) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          className: "cursor-pointer",
          onClick: () => openSingleSupplier(each.id),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.fullName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.address }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.phoneNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.balance) })
          ]
        },
        each.id
      );
    });
    return rows;
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateSupplier, { createSupplierFn: handleNewSupplier });
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EditSupplier, { supplierId: Number(supplierId) });
    }
    return null;
  };
  const sumOfBalances = () => {
    if (suppliers.length === 0) {
      return 0;
    }
    return suppliers.map((item) => {
      return item.balance;
    }).reduce(sum);
  };
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "default",
          size: "sm",
          onClick: () => {
            openSideContent(CONTENT_CREATE);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
            "Create"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => {
            void fetchSuppliers(page, appliedSearch);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
            "Refresh"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: handlePrint, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
              placeholder: "Search Supplier",
              value: searchValue,
              onChange: (e) => {
                const nextSearchValue = e.target.value;
                setSearchValue(nextSearchValue);
                if (nextSearchValue.trim() === "" && appliedSearch !== "") {
                  setAppliedSearch("");
                  setPage(DEFAULT_PAGE);
                }
              }
            }
          )
        }
      ) })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DashboardLayout,
    {
      screenTitle: "Suppliers",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: componentRef, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Phone Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Balance" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: renderRows() })
        ] }),
        isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-right font-semibold", children: [
          "Total: ₦",
          numberWithCommas(sumOfBalances())
        ] }) : null,
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
  SuppliersScreen as default
};
