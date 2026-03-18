import { j as jsxRuntimeExports, B as Button, r as reactExports, e as useSidebarContext, L as Link, d as routes } from "./index-Bzxp2TFY.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { D as DashboardLayout, T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { u as useForm, t, o as objectType, c as coerce, s as stringType } from "./types-eVLlK2xq.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { i as isAdmin, n as numberWithCommas, s as sum } from "./helpers-D3c80cn_.js";
import { g as getSingleCustomerFn, u as updateCustomerFn, a as getCustomersFn, d as deleteCustomerFn, s as searchCustomerFn, c as createCustomerFn } from "./customer.controller-CcI8DpcE.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
import { R as RefreshCw } from "./refresh-cw-DEY85FrQ.js";
import { P as Printer } from "./printer-BxDK0O1H.js";
const schema$1 = objectType({
  fullName: stringType().min(1, "Required"),
  address: stringType().optional().default(""),
  phoneNumber: stringType().optional().default(""),
  balance: coerce.number().optional().default(0)
});
const CreateCustomer = ({
  createCustomerFn: createCustomerFn2
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(schema$1),
    defaultValues: {
      fullName: "",
      address: "",
      phoneNumber: "",
      balance: 0
    }
  });
  const onSubmit = (values) => {
    createCustomerFn2(values);
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
          type: "text",
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
const schema = objectType({
  fullName: stringType().min(1, "Required"),
  address: stringType().optional().default(""),
  phoneNumber: stringType().optional().default(""),
  balance: coerce.number().optional().default(0),
  maxPriceLevel: coerce.number().optional().default(0)
});
const EditCustomer = ({
  customerId
}) => {
  const [customer, setCustomer] = reactExports.useState({});
  const { closeSideContent } = useSidebarContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(schema)
  });
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleCustomerFn(Number(customerId));
      setCustomer(response);
      reset({
        fullName: response.fullName || "",
        address: response.address || "",
        phoneNumber: response.phoneNumber || "",
        balance: response.balance || 0,
        maxPriceLevel: response.maxPriceLevel || 0
      });
    };
    fetchData();
  }, [customerId, reset]);
  const handleDeleteCustomer = async () => {
    await deleteCustomerFn(Number(customerId));
    closeSideContent();
    await getCustomersFn();
  };
  const onSubmit = async (values) => {
    await updateCustomerFn(
      {
        ...values,
        balance: Number(values.balance),
        maxPriceLevel: Number(values.maxPriceLevel)
      },
      customerId
    );
    closeSideContent();
    await getCustomersFn();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-4", children: [
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
            ...register("balance"),
            disabled: !isAdmin()
          }
        ),
        errors.balance && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.balance.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "maxPriceLevel", children: "Max Price Level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "maxPriceLevel",
            placeholder: "Max Price Level",
            type: "number",
            ...register("maxPriceLevel"),
            disabled: !isAdmin()
          }
        ),
        errors.maxPriceLevel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-destructive", children: errors.maxPriceLevel.message })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          onClick: handleSubmit(onSubmit),
          variant: "default",
          children: "Update"
        }
      ),
      isAdmin() ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleDeleteCustomer,
          type: "button",
          variant: "destructive",
          children: "Delete"
        }
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `${routes.CUSTOMER}/${customerId}`, children: "History" }) })
    ] })
  ] });
};
const CONTENT_CREATE = "create";
const CONTENT_EDIT = "edit";
const CustomersScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [customerId, setCustomerId] = reactExports.useState("");
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [appliedSearch, setAppliedSearch] = reactExports.useState("");
  const [customers, setCustomers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const componentRef = reactExports.useRef(null);
  const handlePrint = Z({});
  const fetchCustomers = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    const response = search ? await searchCustomerFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE,
      search
    }) : await getCustomersFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE
    });
    setCustomers(response.rows ?? []);
    setTotal(response.total ?? 0);
    setLoading(false);
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    void fetchCustomers(page, appliedSearch);
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setCustomerId("");
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);
  const handleNewCustomer = async (values) => {
    await createCustomerFn(values);
    await fetchCustomers();
  };
  const openSingleCustomer = (id) => {
    setCustomerId(id);
    openSideContent(CONTENT_EDIT);
  };
  const renderRows = () => {
    const rows = customers.map((each) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          className: "cursor-pointer",
          onClick: () => openSingleCustomer(each.id),
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
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateCustomer, { createCustomerFn: handleNewCustomer });
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EditCustomer, { customerId: Number(customerId) });
    }
    return null;
  };
  const sumOfBalances = () => {
    if (customers.length === 0) {
      return 0;
    }
    return customers.map((item) => {
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
            void fetchCustomers(page, appliedSearch);
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
              placeholder: "Search Customer",
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
      screenTitle: "Customers",
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
  CustomersScreen as default
};
