import { j as jsxRuntimeExports, B as Button, u as ue, e as useSidebarContext, r as reactExports } from "./index-Bzxp2TFY.js";
import { Z } from "./react-to-print-D67gl_J6.js";
import { d as dayjs } from "./dayjs.min-CRuwFbol.js";
import { D as DashboardLayout, T as Table, b as TableRow, e as TableCell, a as TableHeader, c as TableHead, d as TableBody } from "./table-CxVkuaOT.js";
import { I as Input } from "./input-k_kpy0zT.js";
import { L as Label } from "./label-BlB9ESjn.js";
import { u as useForm, t, C as Controller, o as objectType, s as stringType } from "./types-eVLlK2xq.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BYhGLuyS.js";
import { n as numberWithCommas } from "./helpers-D3c80cn_.js";
import { P as Plus } from "./plus-DCxA-ihm.js";
import { P as Printer } from "./printer-BxDK0O1H.js";
const schema$1 = objectType({
  type: stringType().min(1, "Required"),
  amount: stringType().optional().default(""),
  date: stringType().optional().default(""),
  note: stringType().optional().default("")
});
const CreateExpense = ({
  createExpenseFn: createExpenseFn2
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: t(schema$1),
    defaultValues: {
      type: "",
      amount: "",
      date: "",
      note: ""
    }
  });
  const onSubmit = (values) => {
    createExpenseFn2(values);
    reset();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "type", children: "Sale Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "type",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "advertisement", children: "advertisement" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bank charges & cto", children: "bank charges & cto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "diesel & fuel", children: "diesel & fuel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "generator maintenance", children: "generator maintenance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "miscellaneous", children: "miscellaneous" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "office", children: "office" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pr/gifts", children: "pr/gifts" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "printing & stationary", children: "printing & stationary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rent", children: "rent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "telephone", children: "telephone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "training", children: "training" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transport", children: "transport" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "salary", children: "salary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "staff bonus", children: "staff bonus" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vehicle maintenance", children: "vehicle maintenance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vehicle fuel", children: "vehicle fuel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "water & gas", children: "water & gas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "others", children: "others" })
            ] })
          ] })
        }
      ),
      errors.type && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.type.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "amount",
          placeholder: "Amount",
          type: "number",
          ...register("amount"),
          className: errors.amount ? "border-destructive" : ""
        }
      ),
      errors.amount && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.amount.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "date", children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "date",
          placeholder: "Date",
          type: "date",
          ...register("date"),
          className: errors.date ? "border-destructive" : ""
        }
      ),
      errors.date && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.date.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "note", children: "Note" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "note",
          placeholder: "Note",
          type: "text",
          ...register("note"),
          className: errors.note ? "border-destructive" : ""
        }
      ),
      errors.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive mt-1", children: errors.note.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save" })
  ] });
};
const deleteExpenseFn = async (id, cb) => {
  try {
    await window.api.expense.delete(id);
    ue.success("Successfully deleted");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const updateExpenseFn = async (values, id, cb) => {
  try {
    await window.api.expense.update(id, values);
    ue.success("Successfully updated");
    if (cb) ;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const getSingleExpenseFn = async (id, cb) => {
  try {
    const response = await window.api.expense.getById(id);
    if (cb) ;
    return response;
  } catch (error) {
    ue.error(error.message || "");
    return null;
  }
};
const filterExpensesFn = async ({
  startDate,
  endDate
}) => {
  try {
    return await window.api.expense.filter(startDate, endDate);
  } catch (error) {
    ue.error(error.message || "");
    return [];
  }
};
const createExpenseFn = async (values, cb) => {
  try {
    const response = await window.api.expense.create(values);
    if (cb) ;
    return response;
  } catch (error) {
    ue.error(error.message || "");
  }
};
const schema = objectType({
  type: stringType().optional().default(""),
  amount: stringType().optional().default(""),
  date: stringType().optional().default(""),
  note: stringType().optional().default("")
});
const EditExpense = ({
  expenseId,
  refreshExpenses
}) => {
  const { closeSideContent } = useSidebarContext();
  const { register, handleSubmit, control, reset } = useForm({
    resolver: t(schema)
  });
  reactExports.useEffect(() => {
    const fetchData = async () => {
      const response = await getSingleExpenseFn(expenseId);
      const expense = response;
      reset({
        type: expense.type || "",
        amount: expense.amount ? String(expense.amount) : "",
        date: dayjs(expense.date).format("YYYY-MM-DD") || "",
        note: expense.note || ""
      });
    };
    fetchData();
  }, [expenseId, reset]);
  const handleDeleteExpense = async () => {
    await deleteExpenseFn(expenseId);
    refreshExpenses();
    closeSideContent();
  };
  const onSubmit = async (values) => {
    await updateExpenseFn(
      {
        ...values,
        amount: Number(values.amount),
        date: new Date(values.date || "")
      },
      Number(expenseId)
    );
    refreshExpenses();
    closeSideContent();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "type", children: "Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "type",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { onValueChange: field.onChange, value: field.value, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "advertisement", children: "advertisement" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bank charges & cto", children: "bank charges & cto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "diesel & fuel", children: "diesel & fuel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "generator maintenance", children: "generator maintenance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "miscellaneous", children: "miscellaneous" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "office", children: "office" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pr/gifts", children: "pr/gifts" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "printing & stationary", children: "printing & stationary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rent", children: "rent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "telephone", children: "telephone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "training", children: "training" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transport", children: "transport" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "salary", children: "salary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "staff bonus", children: "staff bonus" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vehicle maintenance", children: "vehicle maintenance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vehicle fuel", children: "vehicle fuel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "water & gas", children: "water & gas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "others", children: "others" })
            ] })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "amount",
          placeholder: "Amount",
          type: "number",
          ...register("amount")
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "date", children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "date", placeholder: "Date", type: "date", ...register("date") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "note", children: "Note" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "note", placeholder: "Note", type: "text", ...register("note") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Update" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: "w-full mt-2",
        onClick: handleDeleteExpense,
        type: "button",
        variant: "destructive",
        children: "Delete"
      }
    )
  ] });
};
const CONTENT_CREATE = "create";
const CONTENT_EDIT = "edit";
const TODAYS_DATE = `${dayjs().format("YYYY-MM-DD")}`;
const ExpensesScreen = () => {
  const [sideContent, setSideContent] = reactExports.useState("");
  const [expenseId, setExpenseId] = reactExports.useState("");
  const [startDate, setStartDate] = reactExports.useState(TODAYS_DATE);
  const [endDate, setEndDate] = reactExports.useState(TODAYS_DATE);
  const [expenses, setExpenses] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const { openSideContent: openSideBar, closeSideContent: closeSideBar } = useSidebarContext();
  const componentRef = reactExports.useRef(null);
  const handlePrint = Z({});
  const filterExpenses = reactExports.useCallback(async () => {
    setLoading(true);
    const response = await filterExpensesFn({ startDate, endDate });
    setExpenses(response);
    setLoading(false);
  }, [endDate, startDate]);
  const sum = (prev, next) => {
    return prev + next;
  };
  const sumOfAmounts = (values = []) => {
    if (values.length === 0) {
      return 0;
    }
    return values.map((item) => {
      return item.amount;
    }).reduce(sum);
  };
  const groupBy = (xs = [], key) => {
    return xs.reduce(
      (rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      },
      {}
    );
  };
  const openSideContent = (content) => {
    openSideBar();
    setSideContent(content);
  };
  reactExports.useEffect(() => {
    filterExpenses();
    return () => {
      const closeSideContent = () => {
        closeSideBar();
        setSideContent("");
        setExpenseId("");
      };
      closeSideContent();
    };
  }, [filterExpenses]);
  const handleNewExpense = async (values) => {
    await createExpenseFn(values);
    filterExpenses();
  };
  const openSingleExpense = (id) => {
    setExpenseId(id);
    openSideContent(CONTENT_EDIT);
  };
  const renderRows = () => {
    const groupedObject = groupBy(expenses, "type");
    const allSections = Object.entries(groupedObject).map(
      ([title, itemArray]) => {
        const itemSum = sumOfAmounts(itemArray);
        const itemSection = itemArray.map((each) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              onClick: () => openSingleExpense(each.id),
              className: "cursor-pointer hover:bg-muted/50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: numberWithCommas(each.amount) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(each.date).toLocaleDateString("en-gb") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: each.note })
              ]
            },
            each.id
          );
        });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: title.toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Note" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            itemSection,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "₦",
                numberWithCommas(itemSum)
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {})
            ] })
          ] })
        ] }, title);
      }
    );
    return allSections;
  };
  const renderSideContent = () => {
    if (sideContent === CONTENT_CREATE) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateExpense, { createExpenseFn: handleNewExpense });
    }
    if (sideContent === CONTENT_EDIT) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        EditExpense,
        {
          expenseId: Number(expenseId),
          refreshExpenses: filterExpenses
        }
      );
    }
    return null;
  };
  const headerContent = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-1 flex-wrap gap-2", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: handlePrint, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: filterExpenses, children: "Filter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: async () => {
                const response = await filterExpensesFn({
                  startDate: TODAYS_DATE,
                  endDate: TODAYS_DATE
                });
                setExpenses(response);
              },
              type: "button",
              variant: "outline",
              children: "Reset"
            }
          )
        ] })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, { screenTitle: "Expenses", rightSidebar: renderSideContent(), children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: componentRef, children: [
    headerContent(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold my-3", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts(expenses))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { children: renderRows() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold text-right", children: [
      "Total: ₦",
      numberWithCommas(sumOfAmounts(expenses))
    ] })
  ] }) });
};
export {
  ExpensesScreen as default
};
