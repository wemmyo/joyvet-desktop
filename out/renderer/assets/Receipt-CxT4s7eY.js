import { u as ue, g as getUserSession, r as reactExports, j as jsxRuntimeExports, B as Button, e as useSidebarContext } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { T as Table, d as TableBody, b as TableRow, e as TableCell, D as DashboardLayout, a as TableHeader, c as TableHead } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { u as useForm, t, C as Controller, o as objectType, s as stringType, c as coerce } from "./types-eVLlK2xq.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { n as numberWithCommas } from "./helpers-D3c80cn_.js";
import { g as getSingleCustomerFn, a as getCustomersFn } from "./customer.controller-CcI8DpcE.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
import { R as RefreshCw } from "./refresh-cw-DEY85FrQ.js";
const emptyReceipts = (query) => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25
});
const searchReceiptFn = async (query) => {
  try {
    return await window.api.receipt.search(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyReceipts(query);
  }
};
const updateReceiptFn = (values, id, cb) => async () => {
  try {
    await window.api.receipt.update(id, values);
    ue.success("Successfully updated");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const getSingleReceiptFn = async (id, cb) => {
  try {
    const receipt = await window.api.receipt.getById(id);
    if (cb) ;
    return receipt;
  } catch (error) {
    ue.error(error.message || "");
    return null;
  }
};
const getReceiptsFn = async (query) => {
  try {
    return await window.api.receipt.getAll(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyReceipts(query);
  }
};
const deleteReceiptFn = async (id) => {
  try {
    await window.api.receipt.delete(id);
    ue.success("Receipt successfully deleted");
  } catch (error) {
    ue.error(error.message || "");
  }
};
const createReceiptFn = async (values, cb) => {
  try {
    const user = getUserSession();
    await window.api.receipt.create({
      ...values,
      postedBy: user?.fullName ?? ""
    });
    ue.success("Receipt successfully created");
    if (cb) cb();
  } catch (error) {
    ue.error(error.message || "");
  }
};
const createReceiptSchema = objectType({
  customerId: stringType().min(1, "Customer is required"),
  amount: coerce.number().min(1, "Amount is required"),
  paymentMethod: stringType().min(1, "Payment method is required"),
  bank: stringType().optional(),
  note: stringType().optional()
});
const CreateReceipt = () => {
  const [customers, setCustomers] = reactExports.useState([]);
  const [singleCustomer, setSingleCustomer] = reactExports.useState(
    {}
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: t(createReceiptSchema),
    defaultValues: {
      customerId: "",
      amount: 0,
      paymentMethod: "",
      bank: "",
      note: ""
    }
  });
  const watchedPaymentMethod = watch("paymentMethod");
  const fetchCustomers = async () => {
    const response = await getCustomersFn();
    setCustomers(response.rows ?? []);
  };
  const fetchReceipts = async () => {
    await getReceiptsFn();
  };
  reactExports.useEffect(() => {
    fetchCustomers();
  }, []);
  const handleNewReceipt = (values) => {
    createReceiptFn(
      {
        ...values,
        customerId: Number(values.customerId),
        amount: Number(values.amount)
      },
      () => {
        fetchReceipts();
      }
    );
  };
  const showCustomerBalance = () => {
    if (singleCustomer.balance) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border bg-muted px-3 py-2 text-sm mb-3", children: `Balance: ${numberWithCommas(singleCustomer.balance)}` });
    }
    return null;
  };
  const renderBanks = (paymentMethod) => {
    if (paymentMethod === "transfer") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bank", children: "Bank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "bank",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Bank" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "GTB", children: "GTB" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "FCMB", children: "FCMB" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "First Bank", children: "First Bank" })
              ] })
            ] })
          }
        )
      ] });
    }
    return null;
  };
  const onSubmit = (values) => {
    handleNewReceipt(values);
    reset();
    setSingleCustomer({});
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(onSubmit), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "customerId", children: "Customer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "customerId",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              onValueChange: async (val) => {
                field.onChange(val);
                await getSingleCustomerFn(Number(val));
              },
              value: field.value,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Customer" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.fullName }, c.id)) })
              ]
            }
          )
        }
      ),
      errors.customerId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.customerId.message })
    ] }),
    showCustomerBalance(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "amount",
          type: "text",
          placeholder: "Amount",
          ...register("amount")
        }
      ),
      errors.amount && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.amount.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "paymentMethod", children: "Payment Method" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "paymentMethod",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select option" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash", children: "Cash" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transfer", children: "Transfer" })
            ] })
          ] })
        }
      ),
      errors.paymentMethod && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.paymentMethod.message })
    ] }),
    renderBanks(watchedPaymentMethod),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "note", children: "Note" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "note",
          type: "text",
          placeholder: "Note",
          ...register("note")
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save" })
  ] }) });
};
const schema = objectType({
  customerId: stringType().optional().default(""),
  amount: stringType().optional().default(""),
  note: stringType().optional().default("")
});
const EditReceipt = ({
  receiptId
}) => {
  const [customers, setCustomers] = reactExports.useState([]);
  const { closeSideContent } = useSidebarContext();
  const { register, handleSubmit, control, reset } = useForm({
    resolver: t(schema)
  });
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const getSingleReceipt = getSingleReceiptFn(receiptId);
      const getCustomers = getCustomersFn();
      const [receiptResponse, customersResponse] = await Promise.all([
        getSingleReceipt,
        getCustomers
      ]);
      const receipt = receiptResponse;
      reset({
        customerId: receipt.customerId ? String(receipt.customerId) : "",
        amount: receipt.amount ? String(receipt.amount) : "",
        note: receipt.note || ""
      });
      setCustomers(customersResponse.rows ?? []);
    };
    fetchData();
  }, [receiptId, reset]);
  const onSubmit = async (values) => {
    await updateReceiptFn(values, receiptId);
    closeSideContent();
    await getReceiptsFn();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "customerId", children: "Customer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "customerId",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Customer" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.fullName }, c.id)) })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount Paid" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "amount",
          placeholder: "Amount Paid",
          type: "text",
          ...register("amount")
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "note", children: "Note" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "note", placeholder: "Note", type: "text", ...register("note") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Update" })
  ] });
};
const ReceiptDetail = ({
  receiptId
}) => {
  const [singleReceipt, setSingleReceipt] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const { closeSideContent } = useSidebarContext();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSingleReceiptFn(receiptId);
      setSingleReceipt(response);
      setLoading(false);
    };
    fetchData();
  }, [receiptId]);
  const handleDelete = async () => {
    await deleteReceiptFn(receiptId);
    await getReceiptsFn();
    closeSideContent();
  };
  const {
    customer,
    amount,
    note,
    createdAt,
    paymentMethod,
    // paymentType,
    bank
  } = singleReceipt;
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: customer ? customer.fullName : "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Customer balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: customer ? customer.balance : 0 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: amount || "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: paymentMethod || "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Bank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: bank || "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Note" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: note || "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: createdAt ? new Date(createdAt).toLocaleDateString("en-gb") : "" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleDelete(), variant: "destructive", children: "Delete" })
  ] });
};
const CONTENT_CREATE = "create";
const CONTENT_EDIT = "edit";
const CONTENT_DETAIL = "detail";
const ReceiptsScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [receiptId, setReceiptId] = reactExports.useState("");
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [appliedSearch, setAppliedSearch] = reactExports.useState("");
  const [receipts, setReceipts] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const fetchReceipts = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    const response = search ? await searchReceiptFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE,
      search
    }) : await getReceiptsFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE
    });
    setReceipts(response.rows ?? []);
    setTotal(response.total ?? 0);
    setLoading(false);
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    void fetchReceipts(page, appliedSearch);
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setReceiptId("");
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);
  const viewSingleReceipt = (id) => {
    setReceiptId(id);
    openSideContent(CONTENT_DETAIL);
  };
  const renderRows = () => {
    const rows = receipts.map((each) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          onClick: () => viewSingleReceipt(each.id),
          className: "cursor-pointer hover:bg-muted/50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.customer?.fullName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.amount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.paymentMethod }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(each.createdAt).format("DD/MM/YYYY") })
          ]
        },
        each.id
      );
    });
    return rows;
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateReceipt, {});
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EditReceipt, { receiptId });
    }
    if (sideContent === CONTENT_DETAIL) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptDetail, { receiptId });
    }
    return null;
  };
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            openSideContent(CONTENT_CREATE);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
            "Create"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => {
            void fetchReceipts(page, appliedSearch);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1 h-4 w-4" }),
            "Refresh"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            setAppliedSearch(searchValue.trim());
            setPage(DEFAULT_PAGE);
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search Receipt No",
              onChange: (event) => {
                handleSearchChange(event);
                if (event.target.value.trim() === "" && appliedSearch !== "") {
                  setAppliedSearch("");
                  setPage(DEFAULT_PAGE);
                }
              },
              value: searchValue
            }
          )
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DashboardLayout,
    {
      screenTitle: "Receipts",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Receipt no" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment Method" }),
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
  ReceiptsScreen as default
};
