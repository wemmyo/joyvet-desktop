import { u as ue, g as getUserSession, r as reactExports, j as jsxRuntimeExports, B as Button, e as useSidebarContext } from "./index-Bzxp2TFY.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { T as Table, d as TableBody, b as TableRow, e as TableCell, D as DashboardLayout, a as TableHeader, c as TableHead } from "./table-CxVkuaOT.js";
import { D as DEFAULT_PAGE, P as PaginationControls, a as DEFAULT_PAGE_SIZE } from "./pagination-p-wugHf2.js";
import { u as useForm, t, C as Controller, o as objectType, s as stringType, c as coerce } from "./types-eVLlK2xq.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { n as numberWithCommas } from "./helpers-D3c80cn_.js";
import { g as getSingleSupplierFn, a as getSuppliersFn } from "./supplier.controller-C7GcSgos.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
import { R as RefreshCw } from "./refresh-cw-DEY85FrQ.js";
const emptyPayments = (query) => ({
  rows: [],
  total: 0,
  page: query?.page ?? 1,
  pageSize: query?.pageSize ?? 25
});
const searchPaymentFn = async (query) => {
  try {
    return await window.api.payment.search(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyPayments(query);
  }
};
const updatePaymentFn = async (values, id, cb) => {
  try {
    await window.api.payment.update(id, values);
    ue.success("Successfully updated");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const getSinglePaymentFn = async (id, cb) => {
  try {
    const payment = await window.api.payment.getById(id);
    if (cb) ;
    return payment;
  } catch (error) {
    ue.error(error.message || "");
    return null;
  }
};
const getPaymentsFn = async (query) => {
  try {
    return await window.api.payment.getAll(query);
  } catch (error) {
    ue.error(error.message || "");
    return emptyPayments(query);
  }
};
const deletePaymentFn = async (id) => {
  try {
    await window.api.payment.delete(id);
    ue.success("Payment successfully deleted");
  } catch (error) {
    ue.error(error.message || "");
  }
};
const createPaymentFn = async (values, cb) => {
  try {
    const user = getUserSession();
    await window.api.payment.create({
      ...values,
      postedBy: user?.fullName ?? ""
    });
    ue.success("Payment successfully created");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const createPaymentSchema = objectType({
  supplierId: stringType().min(1, "Supplier is required"),
  amount: coerce.number().min(1, "Amount is required"),
  paymentMethod: stringType().min(1, "Payment method is required"),
  bank: stringType().optional(),
  note: stringType().optional()
});
const CreatePayment = ({ refreshPayments }) => {
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [singleSupplier, setSingleSupplier] = reactExports.useState(
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
    resolver: t(createPaymentSchema),
    defaultValues: {
      supplierId: "",
      amount: 0,
      paymentMethod: "",
      bank: "",
      note: ""
    }
  });
  const watchedPaymentMethod = watch("paymentMethod");
  reactExports.useEffect(() => {
    const fetchSuppliers = async () => {
      const response = await getSuppliersFn();
      setSuppliers(response.rows ?? []);
    };
    fetchSuppliers();
  }, []);
  const showSupplierBalance = () => {
    if (singleSupplier.balance) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded border bg-muted px-3 py-2 text-sm mb-3", children: `Balance: ${numberWithCommas(singleSupplier.balance)}` });
    }
    return null;
  };
  const renderBanks = (paymentMethod) => {
    if (paymentMethod === "transfer") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
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
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "First Bank", children: "First Bank" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "UBA", children: "UBA" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Zenith", children: "Zenith" })
              ] })
            ] })
          }
        )
      ] });
    }
    return null;
  };
  const onSubmit = async (values) => {
    await createPaymentFn({
      ...values,
      supplierId: Number(values.supplierId),
      amount: Number(values.amount)
    });
    refreshPayments();
    reset();
    setSingleSupplier({});
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(onSubmit), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "supplierId", children: "Supplier" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "supplierId",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              onValueChange: async (val) => {
                field.onChange(val);
                const supplier = await getSingleSupplierFn(Number(val));
                if (supplier) setSingleSupplier(supplier);
              },
              value: field.value,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Supplier" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.fullName }, s.id)) })
              ]
            }
          )
        }
      ),
      errors.supplierId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.supplierId.message })
    ] }),
    showSupplierBalance(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "amount",
          type: "number",
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
const PaymentDetail = ({ paymentId, refreshPayments }) => {
  const [singlePayment, setSinglePayment] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(true);
  const { closeSideContent } = useSidebarContext();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getSinglePaymentFn(Number(paymentId));
      setSinglePayment(response);
      setLoading(false);
    };
    fetchData();
  }, [paymentId]);
  const handleDelete = async () => {
    await deletePaymentFn(paymentId);
    refreshPayments();
    closeSideContent();
  };
  const { supplier, amount, note, createdAt, paymentMethod, bank } = singlePayment;
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: supplier ? supplier.fullName : "" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Supplier balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: supplier ? numberWithCommas(supplier.balance) : 0 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(amount) || "" })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(createdAt).format("DD/MM/YYYY") || "" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleDelete(), variant: "destructive", children: "Delete" })
  ] });
};
const editPaymentSchema = objectType({
  supplierId: stringType().min(1, "Supplier is required"),
  amount: coerce.number().min(0, "Amount is required"),
  note: stringType().optional()
});
const EditPayment = ({
  paymentId
}) => {
  const [payment, setPayment] = reactExports.useState({});
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const { closeSideContent } = useSidebarContext();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(editPaymentSchema),
    defaultValues: {
      supplierId: "",
      amount: 0,
      note: ""
    }
  });
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const [paymentResponse, suppliersResponse] = await Promise.all([
        getSinglePaymentFn(Number(paymentId)),
        getSuppliersFn()
      ]);
      setPayment(paymentResponse);
      setSuppliers(suppliersResponse.rows ?? []);
      reset({
        supplierId: paymentResponse.supplierId ? String(paymentResponse.supplierId) : "",
        amount: paymentResponse.amount || 0,
        note: paymentResponse.note || ""
      });
    };
    fetchData();
  }, [paymentId, reset]);
  const onSubmit = async (values) => {
    await updatePaymentFn(
      {
        ...values,
        supplierId: Number(values.supplierId),
        amount: Number(values.amount)
      },
      Number(paymentId)
    );
    closeSideContent();
    await getPaymentsFn();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(onSubmit), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "supplierId", children: "Supplier" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "supplierId",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Supplier" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.fullName }, s.id)) })
          ] })
        }
      ),
      errors.supplierId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.supplierId.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "amount",
          type: "number",
          placeholder: "Amount",
          ...register("amount")
        }
      ),
      errors.amount && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: errors.amount.message })
    ] }),
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Update" })
  ] }) });
};
const CONTENT_CREATE = "create";
const CONTENT_DETAIL = "detail";
const CONTENT_EDIT = "edit";
const PaymentsScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [paymentId, setPaymentId] = reactExports.useState("");
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [appliedSearch, setAppliedSearch] = reactExports.useState("");
  const [payments, setPayments] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(DEFAULT_PAGE);
  const [total, setTotal] = reactExports.useState(0);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const fetchPayments = async (nextPage = page, search = appliedSearch) => {
    setLoading(true);
    const response = search ? await searchPaymentFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE,
      search
    }) : await getPaymentsFn({
      page: nextPage,
      pageSize: DEFAULT_PAGE_SIZE
    });
    setPayments(response.rows ?? []);
    setTotal(response.total ?? 0);
    setLoading(false);
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    void fetchPayments(page, appliedSearch);
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setPaymentId("");
      };
      closeSideContent();
    };
  }, [appliedSearch, page]);
  const viewPaymentReceipt = (id) => {
    setPaymentId(id);
    openSideContent(CONTENT_DETAIL);
  };
  const renderRows = () => {
    const rows = payments.map((each) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          onClick: () => viewPaymentReceipt(each.id),
          className: "cursor-pointer hover:bg-muted/50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.amount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.paymentMethod }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.bank }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: dayjs(each.createdAt).format("DD/MM/YYYY") })
          ]
        },
        each.id
      );
    });
    return rows;
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_DETAIL) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        PaymentDetail,
        {
          paymentId: Number(paymentId),
          refreshPayments: fetchPayments
        }
      );
    }
    if (sideContent === CONTENT_CREATE) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CreatePayment, { refreshPayments: fetchPayments });
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(EditPayment, { paymentId });
    }
    return null;
  };
  const handleSearchChange = async (e) => {
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
            void fetchPayments(page, appliedSearch);
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
              placeholder: "Search Payment",
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
      screenTitle: "Payments",
      rightSidebar: renderSideContent(),
      headerContent: headerContent(),
      children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment no" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Bank" }),
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
  PaymentsScreen as default
};
